// Purono page - ekhon /register e redirect kore. Delete kore deya jay.
import { redirect } from 'next/navigation';

export default function Page() {
  redirect('/register');
}
