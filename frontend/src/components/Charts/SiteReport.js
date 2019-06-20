import React, { Fragment } from 'react'
import { Paragraph } from '../Typography/Typography'

const dayCount = (dateString1, dateString2) => {
    if (dateString1 && dateString2) {
        const date1 = new Date(dateString1)
        const date2 = new Date(dateString2)
        const difference = date2 - date1 // in milliseconds
        const days = Math.round(difference / (1000 * 60 * 60 * 24))
        return `${ days } days`
    } else {
        return '-'
    }
}

const ratioString = (a, b, precision = 2) => {
    if (a === 0) {
        if (b === 0) return `N/A`
        return `0% (${ a }/${ b })`
    }
    return b !== 0
        ? `${ (a/b).toFixed(precision) }% (${ a }/${ b })`
        : `N/A`
}

const SiteReport = ({ currentSite }) => {
    return (
        <Fragment>
            <Paragraph>
                <strong>Protocol Available to FPFV</strong>:&nbsp; 
                { currentSite['Reg Pack Sent'] || '-' }
            </Paragraph>
            <Paragraph>
                <strong>Contract approval/execution cycle time</strong>:&nbsp; 
                { dayCount(currentSite['Contract Sent'], currentSite['Contract Executed']) } ({ currentSite['Contract Sent'] + ' to ' + currentSite['Contract Executed'] })
            </Paragraph>
            <Paragraph>
                <strong>IRB approval cycle time (Full Committee Review)</strong>:&nbsp; 
                { dayCount(currentSite['IRB Submission'], currentSite['IRB Approval']) } ({ currentSite['IRB Approval'] + ' to ' + currentSite['IRB Approval'] })
            </Paragraph>
            <Paragraph>
                <strong>Site open to accrual to First Patient / First Visit (FPFV)</strong>:&nbsp; 
                { currentSite['Activated For Enrollment'] || '-' }
            </Paragraph>
            <Paragraph>
                <strong>Site open to accrual to Last Patient / First Visit</strong>:&nbsp; 
                { currentSite['Date of last Participant/LPFV'] || '-' }
            </Paragraph>
            <Paragraph>
                <strong>Randomized patients / Consented patients</strong>:&nbsp;
                { ratioString(currentSite['number of randomized patients'], currentSite['Number of consented patients']) }
            </Paragraph>
            <Paragraph>
                <strong>Actual vs expected randomized patient ratio</strong>:&nbsp;
                { ratioString(currentSite['number of randomized patients'], currentSite['Number of randomized patients (expected)']) }
            </Paragraph>
            <Paragraph>
                <strong>Ratio of randomized patients that dropout of the study </strong>:&nbsp;
                { ratioString(currentSite['Number of randomized patients that drop out'], currentSite['number of randomized patients']) }
            </Paragraph>
            <Paragraph>
                <strong>Major protocol deviations / randomized patient </strong>:&nbsp;
                { ratioString(currentSite['Number of Major Protocol Deviations'], currentSite['number of randomized patients']) }
            </Paragraph>
            <Paragraph>
                <strong>Queries per eCRF page</strong>:&nbsp; 
                { currentSite['Number of Queries'] || '-' }
            </Paragraph>
        </Fragment>
    )
}

export default SiteReport