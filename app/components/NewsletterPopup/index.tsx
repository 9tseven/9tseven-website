import { getBanner } from "@/app/lib/banner";
import NewsletterPopupClient from "./NewsletterPopupClient";

export default async function NewsletterPopup() {
  const banner = await getBanner();
  if (!banner) return null;
  return <NewsletterPopupClient title={banner.title} body={banner.body} image={banner.image} />;
}
