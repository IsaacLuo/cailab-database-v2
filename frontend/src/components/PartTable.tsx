import { IPart } from "types";
import * as React from 'react';
import { Table } from "element-react";

interface IProps {
  part: IPart
}

interface IState {

}

export default class PartTable extends React.Component<IProps, IState> {
  private columns = [
    {
      label: "key",
      prop: "key",
      align: "right",
      width: 200,
    }, {
      label: "value",
      prop: "value",
    },
  ]

  constructor(props: IProps) {
    super(props);
  }

  public render () {
    const {part} = this.props;
    const tableData = 
      ['_id', 'labName', 'personalName', 'ownerName', 'sampleType', 'comment', 'createdAt', 'updatedAt', 'date', 'tags'].map(
        v => ({key: v, value:part[v] ? (Array.isArray(part[v]) ? part[v].join('; '): part[v]) : undefined})
      )
      if (part.content) {
        for (const key in part.content) {
          if (part.content[key]) {
            tableData.push({key, value: Array.isArray(part.content[key]) ? part.content[key].join('; ') : part.content[key]});
          }
        }
      }
    return <Table
      columns = {this.columns}
      data = {tableData}
    />
  }
}