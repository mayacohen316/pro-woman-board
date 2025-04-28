import DefaultNode from "./DefaultNode"; // אפשר פשוט להחזיר div או משהו קטן

const nodeTypes = {
  default: DefaultNode,
  bubble: DefaultNode,
  image: DefaultNode,
  emoji: DefaultNode,
};

export default nodeTypes;
