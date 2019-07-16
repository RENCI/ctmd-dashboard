import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import studyEnrollmentChart from './studyEnrollmentChart';

// Temporary enrollment data for testing
const enrollmentString = "CE01-120,Revised Projected Sites,Revised Target Enrolled,Actual Sites,Actual Enrolled\n14-Nov,0,0,0,0\n14-Dec,0,0,0,0\n15-Jan,2,0.4,2,0\n15-Feb,5,1.4,7,0\n15-Mar,10,3.4,9,9\n15-Apr,15,6.4,15,15\n15-May,20,10.4,18,24\n15-Jun,25,15.4,23,29\n15-Jul,32,21.8,26,34\n15-Aug,34,28.6,29,38\n15-Sep,34,35.4,34,41\n15-Oct,34,42.2,34,46\n15-Nov,34,49,34,57\n15-Dec,34,55.8,34,57\n16-Jan,34,62.6,34,59\n16-Feb,34,69.4,34,65\n16-Mar,34,76.2,34,68\n16-Apr,30,82.2,30,72\n16-May,30,88.2,30,73\n16-Jun,30,94.2,30,77\n16-Jul,30,100.2,30,79\n16-Aug,30,106.2,30,81\n";

class StudyEnrollmentContainer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            windowWidth: 0
        };

        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);

        this.enrollmentChart = studyEnrollmentChart();
    }

    updateWindowDimensions() {
        // Should cause a re-render if the window size has changed
        this.setState({
            windowWidth: window.innerWidth
        });
    }

    componentDidMount() {
        this.updateWindowDimensions();

        window.addEventListener('resize', this.updateWindowDimensions);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
    }

    shouldComponentUpdate(props, state) {
        this.drawVisualization(props, this.props, state);

        return false;
    }

    drawVisualization(newProps, oldProps, state) {
        const ratio = 3;

        this.enrollmentChart
            .width(this.div.clientWidth)
            .height(this.div.clientWidth / ratio);

        // Bind data
        d3.select(this.div)
            .datum({
              study: newProps.study,
              sites: newProps.sites,
              enrollmentString: enrollmentString
            })
            .call(this.enrollmentChart);
    }

    render() {
        return (
            <div ref={ div => this.div = div }></div>
        );
    }
}

StudyEnrollmentContainer.propTypes = {
    study: PropTypes.object.isRequired,
    sites: PropTypes.array.isRequired
};

export default StudyEnrollmentContainer
