// StudyEnrollmentContainer.js
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import api from '../../Api'
import axios from 'axios';
import * as d3 from 'd3';
import studyEnrollmentGraph from './studyEnrollmentGraph';

class StudyEnrollmentContainer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            windowWidth: 0,
            enrollmentData: this.props.enrollmentData
        };

        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);

        this.enrollmentGraph = studyEnrollmentGraph();
    }

    updateWindowDimensions() {
        // Should cause a re-render if the window size has changed
        this.setState({
            windowWidth: window.innerWidth
        });
    }

    componentDidMount() {
        this.updateWindowDimensions();

        axios.get(api.studyEnrollmentData(this.props.study.proposalID),  { withCredentials: true })
            .then(result => {
                this.setState({
                    enrollmentData: result.data
                });
             })
             .catch(error => console.log('Error', error));

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
        if (!state.enrollmentData) return;

        // Calculate target enrollment
        const targetEnrolledKey = "targetEnrollment";
        const targetSitesKey = "revisedProjectedSites";

        state.enrollmentData.forEach((d, i, a) => {
          d[targetEnrolledKey] = i === 0 ? 0 :
              a[i - 1][targetEnrolledKey] + a[i - 1][targetSitesKey] * newProps.enrollmentRate;
        });

        const aspectRatio = 3;

        this.enrollmentGraph
            .width(this.div.clientWidth)
            .height(this.div.clientWidth / aspectRatio);

        // Bind data
        d3.select(this.div)
            .datum(state.enrollmentData)
            .call(this.enrollmentGraph);
    }

    render() {
        return (
            <div ref={ div => this.div = div }></div>
        );
    }
}

StudyEnrollmentContainer.propTypes = {
    study: PropTypes.object.isRequired,
    sites: PropTypes.array.isRequired,
    enrollmentRate: PropTypes.number.isRequired
};

export default StudyEnrollmentContainer
