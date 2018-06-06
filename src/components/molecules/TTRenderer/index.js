import React from 'react'
import ReactDOM from 'react-dom'

import LecturePopup from '../LecturePopup'


const block_width = 130
const block_height = 26

class TTRenderer extends React.Component {
    constructor(props) {
        super(props)
        console.log('props:', props)
        this.state = {
            lectures: props.lectures,
            startPoint: null,
            endPoint: null,
            blocks: [
                [0,0,0,0,0,0],
                [0,0,0,0,0,0],
                [0,0,0,0,0,0],
                [0,0,0,0,0,0],
                [0,0,0,0,0,0],
                [0,0,0,0,0,0],
                [0,0,0,0,0,0],
                [0,0,0,0,0,0],
                [0,0,0,0,0,0],
                [0,0,0,0,0,0],
                [0,0,0,0,0,0],
                [0,0,0,0,0,0],
                [0,0,0,0,0,0],
                [0,0,0,0,0,0],
                [0,0,0,0,0,0],
                [0,0,0,0,0,0],
                [0,0,0,0,0,0],
                [0,0,0,0,0,0],
                [0,0,0,0,0,0],
                [0,0,0,0,0,0],
                [0,0,0,0,0,0],
                [0,0,0,0,0,0],
                [0,0,0,0,0,0],
                [0,0,0,0,0,0],
            ]
        }
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.lectures !== nextProps.lectures) {
            this.setState({lectures: nextProps.lectures})
        }
    }

    showStatus = () => {
        const state = this.state
        if (state.startPoint != null && state.endPoint != null) {
            return 'start: (' + state.startPoint.x + ',' + state.startPoint.y + ')' + ' ' + 'end: (' + state.endPoint.x + ',' + state.endPoint.y + ')'
        } else {
            return 'null'
        }
    }

    _onMouseDown = (e) => {
        if (!e.ctrlKey) {
            const startPoint = null
            const endPoint = null
            this.setState({startPoint, endPoint})
            return;
        }

        const startPoint = {x: e.clientX, y: e.clientY}
        const endPoint = {x: e.clientX, y: e.clientY}
        this.setState({startPoint, endPoint})
        window.document.addEventListener('mousemove', this._onMouseMove)
    }

    _onMouseMove = (e) => {
        const endPoint = {x: e.clientX, y:e.clientY}
        this.setState({endPoint})
    }

    _onMouseUp = (e) => {
        if (!this.state.startPoint || !this.state.endPoint)
            return

        // console.log(this.state.lectures)

        window.document.removeEventListener('mousemove', this._onMouseMove)

        const elt = ReactDOM.findDOMNode(this)
        const rect = elt.getBoundingClientRect()
        const eltLeft = rect.left
        const eltTop = rect.top

        const topLeft = {
            x: Math.min(this.state.startPoint.x, this.state.endPoint.x)-eltLeft,
            y: Math.min(this.state.startPoint.y, this.state.endPoint.y)-eltTop
        }
        const botRight = {
            x: Math.max(this.state.startPoint.x, this.state.endPoint.x)-eltLeft,
            y: Math.max(this.state.startPoint.y, this.state.endPoint.y)-eltTop
        }

        var i, j
        var blocks = this.state.blocks
        for (i = 0; i < blocks.length; ++i) {
            for (j = 0; j < blocks[i].length; ++j) {
                if (this.overlap(i, j, topLeft, botRight))
                    blocks[i][j] = 1 - blocks[i][j]
            }
        }

        this.setState({blocks})

        this.props.onChange(blocks)
    }

    overlap = (i, j, tl, br) => {
        const tl1 = {x: (block_width+2)*(j+1), y: (block_height+2)*(i+1)}
        const br1 = {x: (block_width+2)*(j+2), y: (block_height+2)*(i+2)}
        const tl2 = tl
        const br2 = br

        // console.log('block[',i,'][',j,']')
        // console.log(tl1, br1, tl2, br2)

        if (tl1.x > br2.x || tl2.x > br1.x) {
            return false
        }

        if (tl1.y > br2.y || tl2.y > br1.y) {
            return false
        }

        return true
    }

    time_overlap = (_time, _start, _end) => {
        let time = _time.split(':').map((i) => Number(i))
        time = (time[0] * 60) + time[1]

        let start = _start.split(':').map((i) => Number(i))
        start = (start[0] * 60) + start[1]

        let end = _end.split(':').map((i) => Number(i))
        end = (end[0] * 60) + end[1]

        return time < end && start < (time + 30)
    }

    hasLecture = (day, time) => {
        const lectures = this.state.lectures

        for (var i in lectures) {
            const lecture = lectures[i]
            for (var j in lecture.timeSlots) {
                const timeSlot = lecture.timeSlots[j]
                if (day === timeSlot.dayOfWeek && this.time_overlap(time, timeSlot.startTime, timeSlot.endTime)) {
                    return i
                }
            }
        }
        return -1
    }

    renderBlock = (index, time) => {
        const day = ['월', '화', '수', '목', '금', '토'][index]
        const lid = this.hasLecture(day, time)

        if (0 <= lid) {
            return (
                <LecturePopup
                    props={{
                        lecture: this.state.lectures[lid],
                        height: block_height.toString+'px',
                        deleteLecture: this.props.deleteLecture,
                        addToNotRecommends: this.props.addToNotRecommends,
                        notRecommends: this.props.notRecommends,
                    }}
                />
            )
        } else {
            return null
        }
    }

    renderRow = (time, row) => {
        return row.map((elt, index) => (
            <td key={time + '/' + index.toString()}
                onDragStart="return false;"
                draggable="false"
                style={{ 
                    backgroundColor: (elt==1?'#123400': '#FFFFFF'), 
                    border: '1px solid #999999',
                    width: block_width.toString()+'px', 
                    height: block_height.toString()+'px' 
                }}>
                {this.renderBlock(index, time)}
            </td>)
        )

    }

    renderBlocks = () => {
        const blocks = this.state.blocks
        return (
            ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
            '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
            '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30'].map(
                (time, index) => (<tr key={time} ><th>{time}</th>{this.renderRow(time, blocks[index])}</tr>)
            )
        )
        return (blocks.map((row) => (<tr><th>as</th>{this.renderRow(row)}</tr>)))
    }

    render() {
        return (
            <div draggable="false" onDragStart="return false;">
            <div 
                draggable="false"
                onDragStart="return false;"
                style={{width: '1000px', height: '700px'}} 
                onMouseDown={(e) => this._onMouseDown(e)}
                onMouseUp={(e) => this._onMouseUp(e)}
                onDragStart={false}
                onDrag={false}
                onDrop={false}
            >
                <table>
                    <tbody>
                        <tr>
                            <th style={{ width: block_width.toString()+'px', height: block_height.toString()+'px' }}>Time</th>
                            <th style={{ width: block_width.toString()+'px', height: block_height.toString()+'px' }}>Mon</th>
                            <th style={{ width: block_width.toString()+'px', height: block_height.toString()+'px' }}>Tue</th>
                            <th style={{ width: block_width.toString()+'px', height: block_height.toString()+'px' }}>Wed</th>
                            <th style={{ width: block_width.toString()+'px', height: block_height.toString()+'px' }}>Thr</th>
                            <th style={{ width: block_width.toString()+'px', height: block_height.toString()+'px' }}>Fri</th>
                            <th style={{ width: block_width.toString()+'px', height: block_height.toString()+'px' }}>Sat</th>
                        </tr>
                        {this.renderBlocks()}
                    </tbody>
                </table>
            </div>
            <div>
                {this.showStatus()}
            </div>
            </div>
        )
    }
}


export default TTRenderer
