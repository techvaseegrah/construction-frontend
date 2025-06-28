import React from 'react';

const Table = ({
  headers,
  data,
  renderRow,
  emptyMessage = "No data available."
}) => {
  return ( <
    div className = "overflow-x-auto bg-white shadow-md rounded-lg" >
    <
    table className = "min-w-full leading-normal" >
    <
    thead >
    <
    tr > {
      headers.map((header, index) => ( <
        th key = {
          index
        }
        className = "px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider rounded-tl-lg" > {
          header
        } 
        </th>
      ))
    } 
    </tr> 
    </thead>
     <tbody > {
      data.length > 0 ? (
        data.map((item, index) => renderRow(item, index))
      ) : ( <
        tr >
        <
        td colSpan = {
          headers.length
        }
        className = "px-5 py-5 border-b border-gray-200 bg-white text-sm text-center" > {
          emptyMessage
        } 
        </td> 
        </tr>
      )
    } 
    </tbody> 
    </table> 
    </div>
  );
};

export default Table;