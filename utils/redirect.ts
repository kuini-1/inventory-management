import { useRouter } from 'next/navigation';

export default function redirect() {
    const router = useRouter();
    router.push('/login');
}
