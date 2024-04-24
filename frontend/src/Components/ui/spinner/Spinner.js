import ReactSpinner from "react-bootstrap/Spinner";

const CustomSpinner = () => {
  return (
    <ReactSpinner animation="border" role="status">
      <span className="visually-hidden">Loading...</span>
    </ReactSpinner>
  );
};

export default CustomSpinner;
