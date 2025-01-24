import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchMessagesData } from "../../redux/actions/messagesActions";
import Table from "../../components/Table/Table";
import { ThreeDots } from "react-loader-spinner"; // Import the spinner
import "./messages.scss";

const columns = [
  "_id",
  "Sender",
  "Message",
  "Date",
  "Recipient",
  "Reply",
  "ReplyDate",
];

function Messages() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { messagesData, loading } = useSelector((state) => state.messages);

  useEffect(() => {
    const email = sessionStorage.getItem("email");
    if (!email) {
      navigate("/login");
    } else {
      dispatch(fetchMessagesData());
    }
  }, [dispatch, navigate]);

  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredData = messagesData.filter((item) =>
    Object.values(item).some((value) =>
      value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="messagesContainer">
      {loading ? (
        <div className="loadingContainer">
          <ThreeDots
            height="80"
            width="80"
            radius="9"
            color="#3498db"
            ariaLabel="three-dots-loading"
          />
          <div className="loadingMessage">Loading...</div>
        </div>
      ) : (
        <>
          <div className="title">MESSAGES REPORT</div>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <Table columns={columns} data={filteredData} />
        </>
      )}
    </div>
  );
}

export default Messages;
