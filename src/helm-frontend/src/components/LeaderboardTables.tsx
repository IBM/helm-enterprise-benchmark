/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { ChevronUpDownIcon } from "@heroicons/react/24/solid";
import type GroupsTable from "@/types/GroupsTable";
import RowValue from "@/components/RowValue";

interface Props {
  groupsTables: GroupsTable[];
  activeGroup: number;
  ignoreHref?: boolean;
  sortable?: boolean;
  sortFirstMetric?: boolean;
  filtered?: boolean;
  modelsToFilter?: string[];
  numModelsToAutoFilter?: number;
  filteredCols?: any[];
}

export default function LeaderboardTables({
  groupsTables,
  activeGroup,
  ignoreHref = false,
  sortable = true,
  sortFirstMetric = true,
  filtered = false,
  filteredCols = [],
  modelsToFilter = [],
  numModelsToAutoFilter = 0, // if non-zero, sets how many models to filter down to (ranked by first column)
}: Props) {
  const [activeSortColumn, setActiveSortColumn] = useState<number | undefined>(
    sortFirstMetric ? 1 : undefined,
  );
  const [activeGroupsTable, setActiveGroupsTable] = useState<GroupsTable>({
    ...groupsTables[activeGroup],
  });
  const [sortDirection, setSortDirection] = useState<number>(1);
  const [filteredModels, setFilteredModels] =
    useState<string[]>(modelsToFilter);

  interface HeaderValueObject {
    value: string;
  }

  const getHeaderValue = (headerValueObject: HeaderValueObject): string => {
    if (headerValueObject.value === "Model/adapter") {
      return "Model";
    } else {
      return headerValueObject.value;
    }
  };

  useEffect(() => {
    setActiveGroupsTable({ ...groupsTables[activeGroup] });
    // upon receiving and setting data for current table, use sort to figure out n top models
    if (numModelsToAutoFilter) {
      const activeRows = groupsTables[0].rows;
      const sortedRows = activeRows.sort((a, b) => {
        // assumes we sort by column 1, which represents Mean Win Rate in the Core Scenarios table
        // this assumption works as numModelsToAutoFilter is only used in mini leaderboards
        // which always have one main scenario we sort by
        return Number(b[1].value) - Number(a[1].value);
      });
      // Get the top ModelsToAutoFilter
      const topNumRows = sortedRows.slice(0, numModelsToAutoFilter);
      const topNumRowNames = topNumRows.map((row) => String(row[0].value));
      setFilteredModels(topNumRowNames);
    }
  }, [activeGroup, groupsTables, numModelsToAutoFilter]);

  const handleSort = (columnIndex: number) => {
    let sort = sortDirection;
    if (activeSortColumn === columnIndex) {
      sort = sort * -1;
    } else {
      sort = 1;
    }
    setActiveSortColumn(columnIndex);
    setSortDirection(sort);

    setActiveGroupsTable((prev) => {
      const group = { ...prev };
      group.rows.sort((a, b) => {
        const av = a[columnIndex]?.value;
        const bv = b[columnIndex]?.value;
        if (av !== undefined && bv === undefined) {
          return -1;
        }
        if (bv !== undefined && av === undefined) {
          return 1;
        }
        if (typeof av === "number" && typeof bv === "number") {
          return (av - bv) * sort;
        }
        if (typeof av === "string" && typeof bv === "string") {
          if (sort === 1) {
            return av.localeCompare(bv);
          }
          return bv.localeCompare(av);
        }

        return 0;
      });

      return group;
    });
  };
  useEffect(() => {
    if (sortFirstMetric && activeSortColumn) {
      handleSort(activeSortColumn);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortFirstMetric, activeSortColumn]);

  return (
    <>
      {filtered ? (
        <div
          className="rounded-2xl overflow-hidden border-2 bg-white p-1 mx-2 my-0"
          style={{ overflow: "auto" }}
        >
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  {activeGroupsTable.header
                    .filter(
                      (_, cellIdx) =>
                        filteredCols.length === 0 ||
                        filteredCols.includes(cellIdx),
                    )
                    .map((headerValue, idx) => (
                      <th
                        key={`${activeGroup}-${idx}`}
                        className={`${
                          idx === activeSortColumn ? "bg-gray-100" : ""
                        } whitespace-nowrap px-4`}
                      >
                        <div className="flex gap-2 items-center">
                          <span>{getHeaderValue(headerValue)}</span>
                          {sortable ? (
                            <button
                              className="link"
                              onClick={() => handleSort(idx)}
                            >
                              <ChevronUpDownIcon className="w-6 h-6" />
                            </button>
                          ) : null}
                        </div>
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {activeGroupsTable.rows
                  .filter((row) =>
                    filteredModels.includes(String(row[0].value)),
                  )
                  .map((row, idx) => (
                    <tr
                      key={`${activeGroup}-${idx}`}
                      className={`${idx % 2 === 0 ? "bg-gray-50" : ""}`}
                    >
                      {" "}
                      {/* Added alternating row highlighting */}
                      {row
                        // Filtering columns if filteredCols is provided
                        .filter(
                          (_, cellIdx) =>
                            filteredCols.length === 0 ||
                            filteredCols.includes(cellIdx),
                        )
                        .map((rowValue, cellIdx) => (
                          <td
                            key={`${activeGroup}-${cellIdx}`}
                            className={`${cellIdx === 0 ? "text-lg" : ""}`}
                          >
                            <RowValue
                              ignoreHref={ignoreHref && cellIdx === 0}
                              value={rowValue}
                            />
                          </td>
                        ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-lg overflow-hidden shadow-md bg-white p-4">
          <div className="overflow-x-auto">
            <table className="table w-full px-4">
              <thead>
                <tr>
                  {activeGroupsTable.header.map((headerValue, idx) => (
                    <th
                      key={`${activeGroup}-${idx}`}
                      className={`${
                        idx === activeSortColumn ? "bg-gray-100" : ""
                      } whitespace-nowrap px-4`}
                    >
                      <div className="flex gap-2 items-center">
                        <span>{getHeaderValue(headerValue)}</span>
                        {sortable ? (
                          <button
                            className="link"
                            onClick={() => handleSort(idx)}
                          >
                            <ChevronUpDownIcon className="w-6 h-6" />
                          </button>
                        ) : null}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeGroupsTable.rows.map((row, idx) => (
                  <tr
                    key={`${activeGroup}-${idx}`}
                    className={`${idx % 2 === 0 ? "bg-gray-50" : ""}`}
                  >
                    {" "}
                    {/* Added alternating row highlighting */}
                    {row.map((rowValue, cellIdx) => (
                      <td
                        key={`${activeGroup}-${cellIdx}`}
                        className={`${cellIdx === 0 ? "text-lg" : ""}`}
                      >
                        <RowValue
                          ignoreHref={ignoreHref && cellIdx === 0}
                          value={rowValue}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
