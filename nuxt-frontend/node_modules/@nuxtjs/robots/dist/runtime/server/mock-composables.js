export function getPathRobotConfig(e, options) {
  return {
    indexable: true,
    rule: ""
  };
}
export function getSiteRobotConfig(e) {
  return {
    indexable: true,
    hints: []
  };
}
export function getBotDetection(e) {
  return {
    isBot: false
  };
}
export function isBot(e) {
  return false;
}
export function getBotInfo(e) {
  return null;
}
