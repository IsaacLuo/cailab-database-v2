/**
 * partList
 */

// types
import {
  IStoreState,
  IBasket,
  IReactRouterProps,
  IPart,
} from '../../types'

// react
import * as React from 'react'

// redux
import { Dispatch } from 'redux'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'

import { GET_BASKET_FULL, ASSIGN_TUBE_TO_PART,RESIGN_TUBE } from './actions';

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
import ErrorBoundary from '../../components/ErrorBoundary'
import { GET_BASKET_LIST, GET_BASKET } from '../BasketList/actions';
import ClickableIcon from '../../components/ClickableIcon';


const MyClickableIcon = styled(Button)`
  &+&{
    margin-left: 0px;
  }
`;


interface IExpandedPanel {
  type: string,
  expandPannel?: (data:any) => JSX.Element,
}

interface IPartsCount {
  bacteria: number,
  primers: number,
  yeasts: number,
}

interface IProps extends IReactRouterProps {
  basketList: IBasket[],
  basketContent?: IPart[],
  getBasketList: ()=>void,
  getBasket: (basketId:string) => void,
  onChangeBasket: (basketId: string) => void,
  assignTubeToPart: (partId:string, tubeId:string) => void,
  resignTube: (partId:string, tubeId: string) => void,
}

interface IState {
  currentBasketIdx: number,
  currentBarcodeInputIdx: number,
}

const mapStateToProps = (state :IStoreState) => ({
  basketList: state.basket.basketList,
  basketContent: state.assignTubes.basketContent,
})

const mapDispatchToProps = (dispatch :Dispatch) => ({
  getBasketList:() => dispatch({type:GET_BASKET_LIST}),
  getBasket: (basketId:string) => dispatch({type:GET_BASKET_FULL, data:basketId}),
  assignTubeToPart: (partId:string, tubeId:string) => dispatch({type: ASSIGN_TUBE_TO_PART, data: {partId, tubeId}}),
  resignTube: (partId:string, tubeId: string) => dispatch({type: RESIGN_TUBE, data: {partId, tubeId}})
})

class AssignTubes extends React.Component<IProps, IState> {
  private inputRefs = {}
  private columns = [{
    type: 'expand',
    expandPannel: data => {
      return <div className="partDetailPanel"style={{width:'100%'}}>
        <Table
          emptyText = "no data"
          style={{width:'100%'}}
          // rowStyle={{border:0, textAlign:'left'}}
          showHeader={false}
          columns={[
            {
              label: "key",
              prop: "key",
              align: "right",
              width: 200,
            },
            {
              label: "value",
              prop: "value",
            },
          ]}
          data={[
            {key: 'lab name', value: data.labName},
            {key: 'lab name', value: data.personalName},
            {key: 'comment', value: data.comment},
            {key: 'creator', value: data.ownerName},
            {key: 'created at', value: data.createdAt},
            {key: 'updated at', value: data.updatedAt},
            // customData
            // ...Object.keys(data.customData).map(key => ({key, value: data.customData[key]})),
          ]}
        />
      </div>
    },
  },
  {
    label: "personal name",
    prop: "personalName",
    width:100,
  },
  {
    label: "comment",
    prop: "comment",
    minWidth: 200,
    render: (row, column, index) =>
      <div style={{
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>{row.comment}</div> 
  },
  {
    label: "barcodes",
    prop: "barcodes",
    minWidth: 100,
    render: (row, column, index) =>
      <div>
        <div>{row.containers && row.containers.map( v => {
          let textClass = '';
          switch(v.submitStatus) {
            case 'pending':
              textClass = 'blinking';
              break;
            case 'deleting':
              textClass = 'blinking deleting';
              break;
          }
          const assignedAt = typeof(v.assignedAt) === 'string' ? new Date(v.assignedAt) : v.assignedAt;
          return <div key={v.barcode} className = {textClass}>
            {v.barcode}
            {
              v.submitStatus === 'verified' && '✔'
            }
            {(Date.now() - assignedAt) < 1200000 && 
              <ClickableIcon className="el-icon-delete" onClick={this.resignTube.bind(this, row._id, v.barcode)}/>
            }
          </div>}
        )}</div>
      </div>
  },
  {
    label: "new barcodes",
    prop: "newBarcodes",
    minWidth: 50,
    render: (row, column, index) =>
      <div>
        <Input
          ref={x=>{this.inputRefs[index] = x}}
          onKeyUp={this.onBarcodeInputKeyUp.bind(this, row._id)}
          onFocus={this.onBarcodeInputFocus.bind(this, index)}
        />
      </div>
  },
];

  constructor(props) {
    super(props);
    this.state = {
      currentBasketIdx: -1,
      currentBarcodeInputIdx: -1,
    }
  }

  public componentWillMount() {
    this.props.getBasketList();
  }

  public componentDidMount() {
    const {currentBasketIdx, currentBarcodeInputIdx} = this.state;
    if (currentBasketIdx>=0 && this.props.basketList[currentBasketIdx]) {
      if (this.inputRefs[currentBarcodeInputIdx]) {
        // console.log(currentBarcodeInputIdx, this.inputRefs[currentBarcodeInputIdx]);
        this.inputRefs[currentBarcodeInputIdx].focus();
      }
      
    }
  }

  public render() {
    const loading = false;
    const {currentBasketIdx} = this.state;

    const partsTable = currentBasketIdx>=0 && this.props.basketList[currentBasketIdx] ?
      <Table
      emptyText = "no data"
      style={{width: '100%'}}
      columns={this.columns}
      data={this.props.basketContent}
      stripe={true}
    /> :
    <div>no data</div>
    
    return (
      <ErrorBoundary>
        <h1>parts</h1>
        <Select
            // value = {currentBasket}
            clearable = {true}
            onChange = {this.onChangeBasket}
          >
            {
              this.props.basketList.map(
                basket => <Select.Option key={basket._id} label={basket.name} value={basket._id} />
              )
            }
        </Select>
        <Loading loading={loading} text={'loading'}>
          {partsTable}
        </Loading>
      </ErrorBoundary>
    )
  }

  private onChangeBasket = (basketId: string) => {
    // this.props.onChangeBasket(basketId);
    if(basketId !== '') {
      this.props.getBasket(basketId);
      const currentBasketIdx = this.props.basketList.findIndex(v=>v._id === basketId);
      this.setState({currentBasketIdx, currentBarcodeInputIdx: 0});
    } else {
      this.setState({currentBasketIdx: -1, currentBarcodeInputIdx:-1});
    }
    
  }

  private onBarcodeInputKeyUp = (partId, key) => {
    if (key.keyCode === 13) {
      const {currentBarcodeInputIdx} = this.state;
      const currentInput = key.target;
      const tubeId = currentInput.value;
      this.props.assignTubeToPart(partId, tubeId);
      currentInput.value = '';
      console.log(currentBarcodeInputIdx);
      if(this.inputRefs[currentBarcodeInputIdx+1]) {
        this.inputRefs[currentBarcodeInputIdx+1].focus();
      }
      // this.setState({currentBarcodeInputIdx:currentBarcodeInputIdx+1});
    }
  }

  private onBarcodeInputFocus = (refIndex: number) => {
    console.debug('new ref index ', refIndex);
    this.setState({currentBarcodeInputIdx:refIndex});
  }

  private resignTube = (partId: string, tubeId: string) => {
    this.props.resignTube(partId, tubeId);
  }
}



export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AssignTubes))
