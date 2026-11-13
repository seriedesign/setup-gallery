import Swiper from "swiper";
import { Navigation } from "swiper/modules";

for (const el of document.querySelectorAll<HTMLElement>(".js-swiper")) {
	new Swiper(el, { modules: [Navigation] });
}
