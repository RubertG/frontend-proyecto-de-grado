import { Loader2 } from "lucide-react"

interface LoaderProps {
    className?: string;
    size?: number;
}

export const Loader = ({ className, size = 30 }: LoaderProps) => {
    return (  
        <Loader2 size={size} className={`animate-spin mx-auto text-blue-500 ${className}`} />
    )
}