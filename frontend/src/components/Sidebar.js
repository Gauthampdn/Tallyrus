import formatDistanceToNow from "date-fns/formatDistanceToNow"

const Sidebar = ({ template, onClick }) => {
  return (
    <div className="side-details" onClick={onClick}>
      <h4>{template.title}</h4>
      <p>used {formatDistanceToNow(new Date(template.updatedAt), { addSuffix: true })}</p>
    </div>
  );
}

export default Sidebar;
