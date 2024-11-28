import { yettSetup } from "./setup";
import { createWidget } from "./widget";

window.gtBlocklist = window.gtBlocklist || {
  functional: [],
  marketing: [],
  unclassified: [],
  analytics: [],
};

yettSetup(window.gtBlocklist);
createWidget(window.gtBlocklist);
