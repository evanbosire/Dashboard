import React from "react";
import "./table.scss";

const Table = ({ columns = [], data = [], actions = [], loading = false }) => {
  if (loading) return <div>Loading...</div>;

  // Check if data is an array and has content
  if (!Array.isArray(data) || data.length === 0) {
    return <div className="no-data">No data available</div>;
  }

  return (
    <table className="table">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col}>{col}</th>
          ))}
          {actions.length > 0 && <th>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={row._id}>
            {columns.map((col) => (
              <td key={col}>{row[col]}</td>
            ))}
            {actions.length > 0 && (
              <td>
                <div className="action-buttons">
                  {actions.map((action) => (
                    <button
                      key={action.label}
                      className={action.label.toLowerCase()}
                      onClick={() => action.onClick(row._id)}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;
