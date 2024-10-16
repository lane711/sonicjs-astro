import {
  useReactTable,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  type SortingState,
  getSortedRowModel,
  type ColumnDef,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";

const columnHelper = createColumnHelper();

const fallbackData = [
  {
    id: "1",
    title: "Record 1",
  },
];

function Table({ tableConfig }) {
  // debugger;
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [data, setData] = useState(null);
  const [sorting, setSorting] = useState<SortingState>([]) // can set initial sorting state here

  const pageSize = 18;

  const columns = Object.entries(tableConfig.fields).map(([key, value]) =>
    columnHelper.accessor(key, {
      header: value.header || key.charAt(0).toUpperCase() + key.slice(1),
    })
  );

  // console.log("columns", columns);
  // columnHelper.accessor((row) => `${row.firstName} ${row.surname}`, {
  //   id: "fullName",
  //   header: "Full Name",
  // }),
  //   columnHelper.accessor("id", {
  //     header: "Id",
  //   }),
  //   columnHelper.accessor("title", {
  //     header: "Title 2",
  //   }),
  //   columnHelper.accessor("updated_on", {
  //     header: "Last Updated",
  //   }),
  // ];




  const table = useReactTable({
    data: data ?? fallbackData,
    columns,
    debugTable: true,
    getCoreRowModel: getCoreRowModel(),
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(), 
  });

  useEffect(() => {
    console.log("loading");
    setLoading(true);

    const offset = page * pageSize;

    const originPath = `/api/v1/${tableConfig.route}?limit=${pageSize}&offset=${offset}`;

    getData(originPath);
  }, []);

  const getData = (originPath) => {
    if (originPath) {
      fetch(`${originPath}`).then(async (response) => {
        const { data } = await response.json();
        setData(data.data);
        setLoading(false);
      });
    }
  };

  if (table) {
    console.log('sorting', table.getState().sorting)

    return (
      <div className="bg-gray-900">
        <div className="mx-auto">
          <div className="bg-gray-900 py-10">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                  <h1 className="text-base font-semibold leading-6 text-white">
                    {/* REACT {table} */}
                  </h1>
                  <p className="mt-2 text-sm text-gray-300">
                    A list of all the users in your account including their
                    name, title, email and role.
                  </p>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                  <a
                    href={`/admin/forms/${tableConfig.route}`}
                    type="button"
                    className="block rounded-md bg-indigo-500 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                  >
                    Add {tableConfig.name}
                  </a>
                </div>
              </div>
              <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <table className="min-w-full divide-y divide-gray-700">
                      <thead>
                        {table.getHeaderGroups().map((headerGroup) => {
                          return (
                            <tr key={headerGroup.id}>
                              {headerGroup.headers.map((header) => {
                                return (
                                  <th key={header.id} colSpan={header.colSpan}>
                                  {header.isPlaceholder ? null : (
                                    <div
                                      className={
                                        header.column.getCanSort()
                                          ? 'cursor-pointer select-none'
                                          : ''
                                      }
                                      onClick={header.column.getToggleSortingHandler()}
                                      title={
                                        header.column.getCanSort()
                                          ? header.column.getNextSortingOrder() === 'asc'
                                            ? 'Sort ascending'
                                            : header.column.getNextSortingOrder() === 'desc'
                                              ? 'Sort descending'
                                              : 'Clear sort'
                                          : undefined
                                      }
                                    >
                                      {flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                      )}
                                      {{
                                        asc: ' 🔼',
                                        desc: ' 🔽',
                                      }[header.column.getIsSorted() as string] ?? null}
                                    </div>
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
                                  <td
                                    key={cell.id}
                                    className="whitespace-nowrap px-3 py-4 text-sm text-gray-300"
                                  >
                                    {flexRender(
                                      cell.column.columnDef.cell,
                                      cell.getContext()
                                    )}
                                  </td>
                                );
                              })}
                              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                                <a
                                  href="#"
                                  className="text-indigo-400 hover:text-indigo-300"
                                >
                                  Edit
                                </a>
                              </td>
                              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                                <a
                                  href="#"
                                  className="text-indigo-400 hover:text-indigo-300"
                                >
                                  Delete
                                </a>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    <table className="min-w-full divide-y divide-gray-700 mt-20">
                      <thead>
                        <tr>
                          <th
                            scope="col"
                            className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-0"
                          >
                            Name
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                          >
                            Title
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                          >
                            Email
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                          >
                            Role
                          </th>
                          <th
                            scope="col"
                            className="relative py-3.5 pl-3 pr-4 sm:pr-0"
                          >
                            <span className="sr-only">Edit</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        <tr>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-0">
                            Lindsay Walton
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                            Front-end Developer
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                            lindsay.walton@example.com
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                            Member
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                            <a
                              href="#"
                              className="text-indigo-400 hover:text-indigo-300"
                            >
                              Edit
                              <span className="sr-only">, Lindsay Walton</span>
                            </a>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    <div>no data yet</div>;
  }
}

export default Table;
