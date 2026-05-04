import { getBanner } from "@/app/lib/banner";
import BannerClient from "./BannerClient";

export default async function Banner() {
  const banner = await getBanner();
  if (!banner) return null;
  return <BannerClient text={banner.text} closeButton={banner.closeButton} />;
}
