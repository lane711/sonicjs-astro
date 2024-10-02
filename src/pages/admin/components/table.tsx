import {
  useReactTable,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";

const columnHelper = createColumnHelper();

const data = [
  {
    firstName: "Jane",
    surname: "Doe",
    age: 13,
    gender: "Female",
  },
  {
    firstName: "John",
    surname: "Doe",
    age: 43,
    gender: "Male",
  },
  {
    firstName: "Tom",
    surname: "Doe",
    age: 89,
    gender: "Male",
  },
];

const columns = [
  columnHelper.accessor((row) => `${row.firstName} ${row.surname}`, {
    id: "fullName",
    header: "Full Name",
  }),
  columnHelper.accessor("gender", {
    header: "Gender",
  }),
];

function Table({tableName}) {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  const pageSize = 18;

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  useEffect(() => {
    console.log('loading')
    setLoading(true);

    const offset = page * pageSize;


    

    const originPath = `/api/v1/${tableName}?limit=${pageSize}&offset=${offset}`;


    getData(originPath);
  }, []);

  const getData = (originPath) => {
    if (originPath) {
      fetch(`${originPath}`).then(async (response) => {

        const data = await response.json();
        console.log('data', data)
        // setTotal(data.total);
        // setUserData(data.data);
        setLoading(false);
      });
    }
  };

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
                          header.getContext(),
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
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default Table;