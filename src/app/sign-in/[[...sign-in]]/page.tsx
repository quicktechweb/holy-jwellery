// Purono page - ekhon /login e redirect kore. Delete kore deya jay.
import { redirect } from 'next/navigation';

export default function Page() {
  redirect('/login');
}
