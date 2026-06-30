import AppLogo from '../../../image/logo11.png';

export default function ApplicationLogo({ className = '', ...props }) {
    return (
        <img 
            src={AppLogo} 
            alt="Application Logo" 
            className={`object-contain ${className || 'h-10 w-10'}`}
            {...props} 
        />
    );
}
