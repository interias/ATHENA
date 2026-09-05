import { loadContent } from "../lib/content";
import Lab from "../components/Lab";

export default async function Page() {
  return <Lab content={await loadContent()} />;
}
