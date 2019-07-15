import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import studyEnrollmentChart from './studyEnrollmentChart';

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
        this.enrollmentChart
            .width(this.div.clientWidth)
            .height(this.div.clientHeight);;

        // Bind data
        d3.select(this.div)
            .datum({
              study: newProps.study,
              sites: newProps.sites
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
