<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;

class SimulationController extends Controller
{
    /**
     * Tampilkan halaman daftar simulasi.
     */
    public function index(Request $request)
    {
        $simulations = \App\Models\Simulation::with(['user', 'latestLog'])
                        ->where('user_id', $request->user()->id)
                        ->latest()
                        ->get();

        return Inertia::render('Simulations/Index', [
            'simulations' => $simulations,
        ]);
    }

    /**
     * Simpan simulasi baru ke database.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255|unique:simulations,title',
            'description' => 'required|string',
            'visibility' => 'required|in:public,private',
        ]);

        $validated['user_id'] = $request->user()->id ?? null;

        $simulation = \App\Models\Simulation::create($validated);

        return redirect()->route('simulations.show', $simulation->title);
    }

    /**
     * Tampilkan halaman direktori publik.
     */
    public function directory()
    {
        $simulations = \App\Models\Simulation::with(['user', 'latestLog'])
                        ->where('visibility', 'public')
                        ->latest()
                        ->get();

        return Inertia::render('Simulations/Directory', [
            'simulations' => $simulations,
        ]);
    }

    /**
     * Tampilkan halaman detail simulasi (placeholder).
     */
    public function show($title)
    {
        if ($title === 'new') {
            return Inertia::render('Simulations/Show', [
                'simulation' => null,
            ]);
        }
        $simulation = \App\Models\Simulation::where('title', $title)->firstOrFail();
        $simulation->load([
            'logs' => function ($query) use ($simulation) {
                $query->where('simulation_id', $simulation->id)->orderBy('day', 'asc');
            },
            'chatMessages' => function ($query) {
                $query->orderBy('created_at', 'asc');
            }
        ]);
        return Inertia::render('Simulations/Show', [
            'simulation' => $simulation,
        ]);
    }

    public function chat(Request $request, $title)
    {
        $simulation = \App\Models\Simulation::where('title', $title)->firstOrFail();
        $message = $request->input('message');
        $mode = (int) $request->input('mode'); // 1 = Ask, 2 = Smart
        
        // Save User Message
        $userChatMessage = $simulation->chatMessages()->create([
            'sender' => 'user',
            'text' => $message,
            'mode' => $mode
        ]);

        $apiKey = ''; // default fallback
        $keyFilePath = base_path('geminiapi.txt');
        if (file_exists($keyFilePath)) {
            $lines = file($keyFilePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                if (stripos($line, 'API Key') === false && trim($line) !== '') {
                    $apiKey = trim($line);
                    break;
                }
            }
        }
        $endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' . $apiKey;

        if ($mode === 2) {
            $systemInstruction = "You are a smart farming assistant. Analyze the user's intent. If the user wants to run a simulation or update parameters, extract the data and return EXACTLY a JSON object with this structure: {\"intent\": \"simulation\", \"parameters\": {\"ph\": float, \"tds\": float, \"water_temperature\": float, \"target_day\": integer}}. The target_day should be extracted if the user specifies a day. If not specified, omit target_day. If it's a general question, return a normal text response and do NOT return JSON.";
        } else {
            $systemInstruction = "You are a helpful smart farming assistant. Do not extract or run any simulations, just answer the user's questions textually.";
        }

        $payload = [
            'contents' => [
                ['parts' => [['text' => $message]]]
            ],
            'systemInstruction' => [
                'parts' => [['text' => $systemInstruction]]
            ]
        ];

        $response = Http::withHeaders(['Content-Type' => 'application/json'])->post($endpoint, $payload);
        
        if ($response->failed()) {
            $botText = 'Failed to reach AI service.';
            $botMessage = $simulation->chatMessages()->create(['sender' => 'bot', 'text' => $botText, 'mode' => $mode]);
            return response()->json(['error' => $botText, 'details' => $response->json()], 500);
        }

        $data = $response->json();
        $reply = $data['candidates'][0]['content']['parts'][0]['text'] ?? 'Maaf, saya tidak mengerti.';

        if ($mode === 2) {
            // Stage 2 Programmatic Failsafe
            $cleanReply = trim(preg_replace('/```json|```/', '', $reply));
            $decoded = json_decode($cleanReply, true);
            
            if ($decoded && isset($decoded['intent']) && $decoded['intent'] === 'simulation') {
                $params = $decoded['parameters'] ?? [];
                
                if (!isset($params['ph']) || !isset($params['tds']) || !isset($params['water_temperature']) || 
                    $params['ph'] === null || $params['tds'] === null || $params['water_temperature'] === null) {
                    
                    $errorText = 'Warning: Parameter tidak lengkap. Mohon masukkan seluruh parameter (pH, TDS, dan temperatur air).';
                    $botMessage = $simulation->chatMessages()->create(['sender' => 'bot', 'text' => $errorText, 'mode' => $mode]);
                    
                    return response()->json([
                        'status' => 'incomplete_data',
                        'reply' => $errorText,
                        'chat_message' => $botMessage
                    ]);
                }
                
                $predictionData = $this->getPrediction($params['ph'], $params['tds'], $params['water_temperature']);
                $targetDay = isset($params['target_day']) ? (int) $params['target_day'] : (int) $request->input('day', 1);
                
                $logData = array_merge([
                    'day' => $targetDay,
                    'ph' => (float) $params['ph'],
                    'tds' => (float) $params['tds'],
                    'water_temperature' => (float) $params['water_temperature'],
                ], $predictionData);
                
                // If valid, save log
                $simulation->logs()->create($logData);
                
                $clusterLabel = $predictionData['cluster_label'] ?? 'Unknown Cluster';
                $clusterIndex = isset($predictionData['cluster_index']) ? " (Cluster " . $predictionData['cluster_index'] . ")" : "";
                $nutrientsSwitch = $predictionData['nutrients_adder_switch'] ?? 'OFF';
                $nutrientsPct = $predictionData['nutrients_adder_percentage'] ?? '0';
                $phSwitch = $predictionData['ph_reducer_switch'] ?? 'OFF';
                $phPct = $predictionData['ph_reducer_percentage'] ?? '0';
                
                $successText = "Simulation successful! Your data input caused the system to enter {$clusterLabel}{$clusterIndex}. In response, the Nutrients Adder actuator is {$nutrientsSwitch} at {$nutrientsPct}% and the pH Reducer is {$phSwitch} at {$phPct}%.";
                
                $botMessage = $simulation->chatMessages()->create(['sender' => 'bot', 'text' => $successText, 'mode' => $mode]);
                
                return response()->json([
                    'status' => 'simulation_ran',
                    'reply' => $successText,
                    'chat_message' => $botMessage
                ]);
            }
        }
        
        $botMessage = $simulation->chatMessages()->create(['sender' => 'bot', 'text' => $reply, 'mode' => $mode]);

        return response()->json([
            'status' => 'success',
            'reply' => $reply,
            'chat_message' => $botMessage
        ]);
    }

    public function storeLog(Request $request, $title)
    {
        $simulation = \App\Models\Simulation::where('title', $title)->firstOrFail();
        
        $validated = $request->validate([
            'day' => 'required|integer|min:1|max:30',
            'ph' => 'required|numeric|min:0',
            'tds' => 'required|numeric|min:0',
            'water_temperature' => 'required|numeric|min:0',
            'mode' => 'nullable|integer',
            'message' => 'nullable|string'
        ]);
        
        if (!empty($validated['message']) && !empty($validated['mode'])) {
            $simulation->chatMessages()->create([
                'sender' => 'user',
                'text' => $validated['message'],
                'mode' => $validated['mode']
            ]);
        }
        
        $predictionData = $this->getPrediction($validated['ph'], $validated['tds'], $validated['water_temperature']);
        $logData = array_merge([
            'day' => $validated['day'],
            'ph' => $validated['ph'],
            'tds' => $validated['tds'],
            'water_temperature' => $validated['water_temperature'],
        ], $predictionData);
        
        $log = $simulation->logs()->updateOrCreate(
            ['day' => $validated['day']],
            $logData
        );
        
        $reply = 'Simulation successfully saved.';
        if (!empty($validated['mode'])) {
            $clusterLabel = $predictionData['cluster_label'] ?? 'Unknown Cluster';
            $clusterIndex = isset($predictionData['cluster_index']) ? " (Cluster " . $predictionData['cluster_index'] . ")" : "";
            $nutrientsSwitch = $predictionData['nutrients_adder_switch'] ?? 'OFF';
            $nutrientsPct = $predictionData['nutrients_adder_percentage'] ?? '0';
            $phSwitch = $predictionData['ph_reducer_switch'] ?? 'OFF';
            $phPct = $predictionData['ph_reducer_percentage'] ?? '0';
            
            $reply = "Simulation successful! Your data input caused the system to enter {$clusterLabel}{$clusterIndex}. In response, the Nutrients Adder actuator is {$nutrientsSwitch} at {$nutrientsPct}% and the pH Reducer is {$phSwitch} at {$phPct}%.";
            
            $simulation->chatMessages()->create([
                'sender' => 'bot',
                'text' => $reply,
                'mode' => $validated['mode']
            ]);
        }
        
        return response()->json(['status' => 'success', 'log' => $log, 'reply' => $reply]);
    }

    public function destroy($title)
    {
        $simulation = \App\Models\Simulation::where('title', $title)->firstOrFail();
        $simulation->delete();
        
        return redirect()->back();
    }

    public function destroyLog($title, $id)
    {
        $simulation = \App\Models\Simulation::where('title', $title)->firstOrFail();
        $simulation->logs()->where('id', $id)->delete();
        
        return response()->json(['status' => 'success']);
    }

    public function toggleVisibility($title)
    {
        $simulation = \App\Models\Simulation::where('title', $title)->firstOrFail();
        $simulation->visibility = $simulation->visibility === 'public' ? 'private' : 'public';
        $simulation->save();
        
        return redirect()->back();
    }

    private function getPrediction($ph, $tds, $temp)
    {
        $scriptPath = base_path('llm/predict_bridge.py');
        $pythonCmd = PHP_OS_FAMILY === 'Windows' ? 'python' : 'python3';
        $command = escapeshellcmd($pythonCmd) . ' ' . escapeshellarg($scriptPath) . ' ' . escapeshellarg($ph) . ' ' . escapeshellarg($tds) . ' ' . escapeshellarg($temp);
        $output = shell_exec($command);
        
        $prediction = json_decode(trim($output), true);
        
        $clusterInfo = [
            0 => [
                "label" => "Sufficient Nutrients, Acidic pH",
                "description" => "Nutrient levels are adequate but pH is slightly acidic. Water temperature is within normal range.",
                "action" => "Activate pH reducer to adjust pH upward toward the ideal range of 6.0-6.5. Nutrient levels do not require adjustment."
            ],
            1 => [
                "label" => "Optimal Condition",
                "description" => "pH and nutrient levels are both in the ideal range. Water temperature is normal and stable.",
                "action" => "System is fully optimized. No action required. Continue monitoring sensor values regularly."
            ],
            2 => [
                "label" => "Low Nutrients, Acidic pH",
                "description" => "Both pH and nutrient levels are below the ideal range. Water temperature is normal.",
                "action" => "Activate nutrients adder to raise TDS levels. Also consider adjusting pH upward toward 6.0-6.5 for optimal nutrient absorption."
            ]
        ];

        if ($prediction && !isset($prediction['error'])) {
            $clusterIndex = $prediction['cluster_index'];
            $info = $clusterInfo[$clusterIndex] ?? [];
            
            return [
                'nutrients_adder_switch' => $prediction['nutrients_adder_switch'] ?? null,
                'nutrients_adder_percentage' => $prediction['nutrients_adder_percentage'] ?? null,
                'ph_reducer_switch' => $prediction['ph_reducer_switch'] ?? null,
                'ph_reducer_percentage' => $prediction['ph_reducer_percentage'] ?? null,
                'cluster_index' => $clusterIndex + 1,
                'cluster_label' => $info['label'] ?? null,
                'cluster_description' => $info['description'] ?? null,
                'cluster_action' => $info['action'] ?? null,
            ];
        }

        return [];
    }
}
