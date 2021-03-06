/**
 * partList
 */

// types
import {
  IStoreState,
  IBasket,
  IReactRouterProps,
  IUserInfo,
  IColumn,
  IPartListRowData,
  IPart,
} from '../../types'

// react
import * as React from 'react'
import axios from 'axios'
import qs from 'qs'

// redux
import { Dispatch } from 'redux'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import {
  ActionSetNewPartDialogVisible,
  ActionSetEditPartDialogVisible,
} from '../../actions/appActions'
import {
  GET_DEFAULT_BASKET,
  GET_PARTS,
  SET_SKIP,
  SET_LIMIT,
  SET_SEARCH_KEYWORD,
  SET_USER_FILTER,
  SET_SORT_METHOD,
  EXPORT_TO_XLSX,
  } from './actions';

// react-router
import {Redirect} from 'react-router'
import {Link} from 'react-router-dom'

// components
import {
  Pagination,
  Loading,
  Select,
  Button,
  MessageBox,
  Message,
  Table,
  Input,
} from 'element-react'
import styled from 'styled-components'
import {PartList, mapDispatchToProps, mapStateToProps} from '../../pages/PartList';


const MyClickableIcon = styled(Button)`
  &+&{
    margin-left: 0px;
  }
`;

const FullWidthTable = styled(Table)`
  width: 100%;
`

interface IExpandedPanel {
  type: string,
  expandPannel?: (data:any) => JSX.Element,
}



class YeastPartList extends PartList {
  constructor(props) {
    super(props);
  }

  protected getTitle () {
    return 'yeasts'
  }

  protected getSampleType () {
    return 'yeast'
  }
  
  protected generateColumnTitle() :Array<IColumn|IExpandedPanel> {
    const {userId} = this.props;
    return [
      {
        type: 'selection',
      },
      this.generateExpandTablePanel(),
      {
        label: "lab name",
        prop: "labName",
        sortable: "custom",
        width:100,
      },
      {
        label: "personal name",
        prop: "personalName",
        sortable: "custom",
        width:100,
      },
      {
        label: "other names",
        prop: "tags",
        sortable: "custom",
        width:200,
        render: (data) =>
          <div style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>{this.format(data.tags)}</div> 
      },
      {
        label: "parents",
        prop: "parents",
        sortable: "custom",
        width: 180,
      },
      {
        label: "markers",
        prop: "markers",
        sortable: "custom",
        width: 180,
        render: (data) =>
          <div style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>{this.format(data.tags)}</div> 
      },
      {
        label: "comment",
        prop: "comment",
        sortable: "custom",
        minWidth: 200,
        render: (row, column, index) =>
          <div style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            textAlign:'left',
          }}>{row.comment}</div> 
      },
      {
        label: "markers",
        prop: "markers",
        sortable: "custom",
        width: 120,
      },
      {
        label: "date",
        prop: "date",
        sortable: "custom",
        width: 180,
        render: (data) => (new Date(data.createdAt).toLocaleDateString()),
      },
      {
        label: "...",
        prop: "attachments",
        width: 100,
        render: (row, column, index) =>
        <div>
          {row.attachments&& row.attachments[0] &&
            (<a
              onClick={this.onClickAttachment.bind(this,row.attachments[0].fileId, row.attachments[0].fileName)}
            >
              <MyClickableIcon type="text" icon="document"/>
            </a>)
          }
          {row.ownerId === userId && <MyClickableIcon type="text" icon="edit" onClick={this.onClickEditPart.bind(this, row)} />}
          {row.ownerId === userId && <MyClickableIcon type="text" icon="delete2" onClick={this.onClickDeletePart.bind(this, row)} />}
        </div>
      }
      ];
    }
    
  // private generatePrimerColumnTitle () :Array<IColumn|IExpandedPanel>{
  //   const {userId} = this.props;
  //   return [
  //   {
  //     type: 'selection',
  //   },
  //   {
  //     type: 'expand',
  //     expandPannel: data => {
  //       const attachmentRows = data && data.attachments&& data.attachments.map(att => 
  //       <div key={att.fileId}>
  //         <a
  //           onClick={this.onClickAttachment.bind(this,att.fileId, att.fileName)}
  //         >
  //           {att.fileName},
  //           {fileSizeHumanReadable(att.fileSize)}
  //         </a>
  //       </div>);
  //       return <div className="partDetailPanel"style={{width:'100%'}}>
  //         <Table
  //           style={this.detailTableStyle}
  //           rowStyle={this.rowStyle}
  //           showHeader={false}
  //           columns={[
  //             {
  //               label: "key",
  //               prop: "key",
  //               align: "right",
  //               width: 200,
  //             },
  //             {
  //               label: "value",
  //               prop: "value",
  //             },
  //           ]}
  //           data={[
  //             {key: 'description', value: data.comment},
  //             {key: 'sequence', value: data.sequence},
  //             {key: 'orientation', value: data.orientation},
  //             {key: 'melting temperature', value: data.meltingTemperature},
  //             {key: 'concentration', value: data.concentration},
  //             {key: 'vendor', value: data.vendor},
  //             // customData
  //             ...Object.keys(data.customData).map(key => ({key, value: data.customData[key]})),
  //           ]}
  //         />
  //       {data.attachments&& data.attachments.length > 0 &&
  //         (<div style={{marginTop:10, marginBottom: 5}}> 
  //           <div><b>attachments</b></div> 
  //           {attachmentRows}
  //         </div>
  //       )}
  //       </div>
  //     },
  //   },
  //   {
  //     label: "lab name",
  //     prop: "labName",
  //     sortable: "custom",
  //     width:100,
  //   },
  //   {
  //     label: "personal name",
  //     prop: "personalName",
  //     sortable: "custom",
  //     width:150,
  //   },
  //   {
  //     label: "other names",
  //     prop: "tags",
  //     sortable: "custom",
  //     width:100,
  //   },
  //   {
  //     label: "comment",
  //     prop: "comment",
  //     sortable: "custom",
  //     minWidth: 200,
  //     render: (data, column, index) =>
  //       <div style={{
  //         overflow: 'hidden',
  //         textOverflow: 'ellipsis',
  //         whiteSpace: 'nowrap',
  //       }}>{data.description} {data.comment}</div> 
  //   },
  //   {
  //     label: "date",
  //     prop: "date",
  //     sortable: "custom",
  //     width: 180,
  //   },
  //   {
  //     label: "...",
  //     prop: "attachment",
  //     width: 100,
  //     render: (row, column, index) =>
  //     <div>
  //       {row.attachments&& row.attachments[0] &&
  //         (<a
  //           onClick={this.onClickAttachment.bind(this,row.attachments[0].fileId, row.attachments[0].fileName)}
  //         >
  //           <MyClickableIcon type="text" icon="document"/>
  //         </a>)
  //       }
  //       {row.ownerId === userId && <MyClickableIcon type="text" icon="edit" onClick={this.onClickEditPart.bind(this, row)} />}
  //       {row.ownerId === userId && <MyClickableIcon type="text" icon="delete2" onClick={this.onClickDeletePart.bind(this, row)} />}
  //     </div>
  //   }
  //   ];
  // }

  // private generateYeastColumnTitle () :Array<IColumn|IExpandedPanel>{
  //   const {userId} = this.props;
  //   return [
  //     {
  //       type: 'selection',
  //     },
  //     {
  //       type: 'expand',
  //       expandPannel: data => {
  //         const attachmentRows = data && data.attachments&& data.attachments.map(att => 
  //         <div key={att.fileId}>
  //           <a
  //             onClick={this.onClickAttachment.bind(this,att.fileId, att.fileName)}
  //           >
  //             {att.fileName},
  //             {fileSizeHumanReadable(att.fileSize)}
  //           </a>
  //         </div>);
          
  //         const containerRows = data && data.containers && data.containers.map(container => 
  //         <div key={container.barcode}>
  //           <Link to={`/tasks/searchTubeBarcode/${container.barcode}`}>
  //             {container.barcode}
  //           </Link>
  //         </div>);

  //         return <div className="partDetailPanel"style={{width:'100%'}}>
  //           <Table
  //             style={this.detailTableStyle}
  //             rowStyle={this.rowStyle}
  //             showHeader={false}
  //             columns={[
  //               {
  //                 label: "key",
  //                 prop: "key",
  //                 align: "right",
  //                 width: 200,
  //               },
  //               {
  //                 label: "value",
  //                 prop: "value",
  //               },
  //             ]}
  //             data={[
  //               {key: 'description', value: data.comment},
  //               {key: 'parents', value: data.parents},
  //               {key: 'genotype', value: data.genotype},
  //               {key: 'plasmidType', value: data.plasmidType},
  //               {key: 'markers', value: data.markers},
  //               {key: 'createdAt', value: data.createdAt},
  //               // customData
  //               ...Object.keys(data.customData).map(key => ({key, value: data.customData[key]})),
  //             ]}
  //           />
  //         {data.attachments&& data.attachments.length > 0 &&
  //           (<div style={{marginTop:10, marginBottom: 5}}> 
  //             <div><b>attachments</b></div> 
  //             {attachmentRows}
  //           </div>
  //         )}
  //         {data.containers&& data.containers.length > 0 &&
  //           (<div style={{marginTop:10, marginBottom: 5}}> 
  //             <div><b>containers</b></div> 
  //             {containerRows}
  //           </div>
  //         )}
  //         </div>
  //       },
  //     },
  //     {
  //       label: "lab name",
  //       prop: "labName",
  //       sortable: "custom",
  //       width:100,
  //     },
  //     {
  //       label: "personal name",
  //       prop: "personalName",
  //       sortable: "custom",
  //       width:150,
  //     },
  //     {
  //       label: "other names",
  //       prop: "tags",
  //       sortable: "custom",
  //       width:100,
  //     },
  //     {
  //       label: "comment",
  //       prop: "comment",
  //       sortable: "custom",
  //       minWidth: 200,
  //       render: (data, column, index) =>
  //         <div style={{
  //           overflow: 'hidden',
  //           textOverflow: 'ellipsis',
  //           whiteSpace: 'nowrap',
  //         }}>{data.description} {data.comment}</div> 
  //     },
  //     {
  //       label: "parents",
  //       prop: "parents",
  //       sortable: "custom",
  //       width: 180,
  //     },
  //     {
  //       label: "markers",
  //       prop: "markers",
  //       sortable: "custom",
  //       width: 180,
  //     },
  //     {
  //       label: "date",
  //       prop: "date",
  //       sortable: "custom",
  //       width: 180,
  //     },
  //     {
  //       label: "...",
  //       prop: "attachment",
  //       width: 100,
  //       render: (row, column, index) =>
  //       <div>
  //         {row.attachments&& row.attachments[0] &&
  //           (<a
  //             onClick={this.onClickAttachment.bind(this,row.attachments[0].fileId, row.attachments[0].fileName)}
  //           >
  //             <MyClickableIcon type="text" icon="document"/>
  //           </a>)
  //         }
  //         {row.ownerId === userId && <MyClickableIcon type="text" icon="edit" onClick={this.onClickEditPart.bind(this, row)} />}
  //         {row.ownerId === userId && <MyClickableIcon type="text" icon="delete2" onClick={this.onClickDeletePart.bind(this, row)} />}
  //       </div>
  //     }
  //     ];
  // }

  // private async getCount () {
  //   const {sampleType} = this.props;
  //   const {userFilter} = this.state;
  //   const res = await axios.get(serverURL+'/api/parts/count?'+qs.stringify({
  //     type: sampleType,
  //     ownerId: userFilter,
  //   }),
  //   getAuthHeader());
  //   return res.data.count;
  // }

  // private async fetchPartsData() {
  //   const {sampleType} = this.props;
  //   const {skip, limit, userFilter, sortMethod} = this.state;

  //   const total = await this.getCount();
  //   this.setState({total, loading: true});
    
  //   const res = await axios.get(serverURL+'/api/parts?'+qs.stringify({
  //     type: sampleType,
  //     skip,
  //     limit,
  //     user: userFilter,
  //     sortBy: sortMethod.prop,
  //     desc: sortMethod.order === 'descending' ? true : false,
  //   }),
  //   getAuthHeader());
  //   console.log(res)

  //   let data:IPartListRowData[] = [];
  //   switch (sampleType) {
  //   case 'bacterium':
  //     data = res.data.map(item => ({
  //       _id: item._id,
  //       labName: item.labName,
  //       personalName: item.personalName,
  //       tags: item.tags ? item.tags.join('; ') : '',
  //       hostStrain: item.content.hostStrain ? item.content.hostStrain : '',
  //       markers: item.content.markers ? item.content.markers.join('; ') : '',
  //       date: item.date ? (new Date(item.date)).toLocaleDateString() : '',
  //       comment: item.comment ? item.comment : '',
  //       ownerId: item.ownerId,
  //       ownerName: item.ownerName,
  //       createdAt: new Date(item.createdAt).toLocaleDateString(),
  //       updatedAt: new Date(item.updatedAt).toLocaleDateString(),
  //       createdAtRaw: item.createdAt,
  //       attachments: item.attachments,
  //       customData: item.content.customData ? item.content.customData : {},
  //     }))
  //   break;
  //   case 'primer':
  //     data = res.data.map(item => ({
  //       _id: item._id,
  //       labName: item.labName,
  //       personalName: item.personalName,
  //       tags: item.tags ? item.tags.join('; ') : '',
  //       date: item.date ? (new Date(item.date)).toLocaleDateString() : '',
  //       comment: `${item.content.description} ${item.comment}`,
  //       attachments: item.attachments,
  //       sequence: item.content.sequence,
  //       orientation: item.content.orientation,
  //       meltingTemperature: item.content.meltingTemperature,
  //       concentration: item.content.concentration,
  //       vendor: item.content.vendor,
  //       ownerId: item.ownerId,
  //       ownerName: item.ownerName,
  //       createdAt: new Date(item.createdAt).toLocaleDateString(),
  //       updatedAt: new Date(item.updatedAt).toLocaleDateString(),
  //       createdAtRaw: item.createdAt,
  //       customData: item.content.customData ? item.content.customData : {},
  //     }))
  //   break;
  //   case 'yeast':
  //     data = res.data.map(item => ({
  //       _id: item._id,
  //       labName: item.labName,
  //       personalName: item.personalName,
  //       tags: item.tags ? item.tags.join('; ') : '',
  //       date: item.date ? (new Date(item.date)).toLocaleDateString() : '',
  //       comment: item.comment,
  //       ownerId: item.ownerId,
  //       ownerName: item.ownerName,
  //       createdAt: new Date(item.createdAt).toLocaleDateString(),
  //       updatedAt: new Date(item.updatedAt).toLocaleDateString(),
  //       createdAtRaw: item.createdAt,
  //       attachments: item.attachments,
  //       containers: item.containers,
        
  //       parents: item.content.parents ? item.content.parents.join('; ') : '' ,
  //       genotype: item.content.genotype ? item.content.genotype.join('; ') : '' ,
  //       plasmidType: item.content.plasmidType,
  //       markers: item.content.markers ? item.content.markers.join('; ') : '' ,
  //       customData: item.content.customData ? item.content.customData : {},
  //     }))
  //   break;
  //   }

  //   this.setState({data, loading:false});
  // }

  // // delete a part directly
  // // @id: the part id
  // private async deletePart(id:string) {
  //   try {
  //     const res = await axios({
  //       url: serverURL+`/api/part/${id}`,
  //       method: 'DELETE',
  //       ...getAuthHeader(),
  //     });
  //     this.fetchPartsData();
  //     Message.success('deleted');
  //   } catch (err) {
  //     if (err.response) {
  //       Message.error(`ERROR ${err.response.status} ${err.response.data.message}`);
  //     } else {
  //       Message.error('unable to delete');
  //     }
  //   }
  // }

  // // send a request to delete a part
  // // @id: the part id
  // private async requestToDeletePart(id:string) {
  //   try {
  //     const res = await axios({
  //       url: serverURL+`/api/sudoRequests/partDeletion/${id}`,
  //       method: 'PUT',
  //       ...getAuthHeader(),
  //     });
  //     this.fetchPartsData();
  //     Message.success('request posted');
  //   } catch (err) {
  //     if (err.response) {
  //       Message.error(`ERROR ${err.response.status} ${err.response.data.message}`);
  //     } else {
  //       Message.error('unable to post request');
  //     }
  //   }
  // }

  // when clicking on the attachment link, download the attachment
}



export default withRouter(connect(mapStateToProps, mapDispatchToProps)(YeastPartList))
