function Message({ role, text }) {
  return (
    <div className={`message ${role}`}>
      {text}
    </div>
  );
}

export default Message;