import {
  useReactTable,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";

const columnHelper = createColumnHelper();

const fallbackData = [
  {
    id: "1",
    title: "Record 1",
  },
];

const columns = [
  // columnHelper.accessor((row) => `${row.firstName} ${row.surname}`, {
  //   id: "fullName",
  //   header: "Full Name",
  // }),
  columnHelper.accessor("id", {
    header: "Id",
  }),
  columnHelper.accessor("title", {
    header: "Title",
  }),
];

function Table({ tableName }) {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [data, setData] = useState(null);

  const pageSize = 18;

  const table = useReactTable({
    data: data ?? fallbackData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  useEffect(() => {
    console.log("loading");
    setLoading(true);

    const offset = page * pageSize;

    const originPath = `/api/v1/${tableName}?limit=${pageSize}&offset=${offset}`;

    getData(originPath);
  }, []);

  const getData = (originPath) => {
    if (originPath) {
      fetch(`${originPath}`).then(async (response) => {
        const {data} = await response.json();
        setData(data.data);
        setLoading(false);
      });
    }
  };

  if (table) {
    return (
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => {
            return (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <th id={header.id}>
                      {" "}
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  );
                })}
              </tr>
            );
          })}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => {
            return (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => {
                  return (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  } else {
    <div>no data yet</div>;
  }
}

export default Table;
