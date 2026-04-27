import NavbarClient from "./NavbarClient";
import { getNavPreviews } from "./getNavPreviews";

export default async function Navbar() {
  const previews = await getNavPreviews();
  return <NavbarClient previews={previews} />;
}
