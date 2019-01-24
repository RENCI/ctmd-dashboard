import React from 'react'
import { ResponsiveBar } from '@nivo/bar'

const data = [
    { "TIC": "AD", "hot dog": 191, "hot dogColor": "hsl(264, 70%, 50%)", "burger": 193, "burgerColor": "hsl(150, 70%, 50%)", "sandwich": 164, "sandwichColor": "hsl(129, 70%, 50%)", "kebab": 122, "kebabColor": "hsl(261, 70%, 50%)", "fries": 183, "friesColor": "hsl(125, 70%, 50%)", "donut": 176, "donutColor": "hsl(211, 70%, 50%)" },
    { "TIC": "AE", "hot dog": 53, "hot dogColor": "hsl(240, 70%, 50%)", "burger": 94, "burgerColor": "hsl(267, 70%, 50%)", "sandwich": 39, "sandwichColor": "hsl(121, 70%, 50%)", "kebab": 149, "kebabColor": "hsl(94, 70%, 50%)", "fries": 73, "friesColor": "hsl(173, 70%, 50%)", "donut": 17, "donutColor": "hsl(294, 70%, 50%)" },
    { "TIC": "AF", "hot dog": 117, "hot dogColor": "hsl(59, 70%, 50%)", "burger": 176, "burgerColor": "hsl(135, 70%, 50%)", "sandwich": 16, "sandwichColor": "hsl(196, 70%, 50%)", "kebab": 124, "kebabColor": "hsl(90, 70%, 50%)", "fries": 97, "friesColor": "hsl(148, 70%, 50%)", "donut": 35, "donutColor": "hsl(58, 70%, 50%)" },
    { "TIC": "AG", "hot dog": 88, "hot dogColor": "hsl(313, 70%, 50%)", "burger": 167, "burgerColor": "hsl(140, 70%, 50%)", "sandwich": 34, "sandwichColor": "hsl(48, 70%, 50%)", "kebab": 77, "kebabColor": "hsl(34, 70%, 50%)", "fries": 181, "friesColor": "hsl(205, 70%, 50%)", "donut": 129, "donutColor": "hsl(283, 70%, 50%)" },
    { "TIC": "AI", "hot dog": 100, "hot dogColor": "hsl(173, 70%, 50%)", "burger": 36, "burgerColor": "hsl(80, 70%, 50%)", "sandwich": 180, "sandwichColor": "hsl(231, 70%, 50%)", "kebab": 34, "kebabColor": "hsl(244, 70%, 50%)", "fries": 154, "friesColor": "hsl(117, 70%, 50%)", "donut": 102, "donutColor": "hsl(349, 70%, 50%)" },
    { "TIC": "AL", "hot dog": 175, "hot dogColor": "hsl(239, 70%, 50%)", "burger": 36, "burgerColor": "hsl(332, 70%, 50%)", "sandwich": 60, "sandwichColor": "hsl(293, 70%, 50%)", "kebab": 118, "kebabColor": "hsl(225, 70%, 50%)", "fries": 65, "friesColor": "hsl(139, 70%, 50%)", "donut": 15, "donutColor": "hsl(29, 70%, 50%)" },
    { "TIC": "AM", "hot dog": 95, "hot dogColor": "hsl(141, 70%, 50%)", "burger": 46, "burgerColor": "hsl(346, 70%, 50%)", "sandwich": 166, "sandwichColor": "hsl(255, 70%, 50%)", "kebab": 140, "kebabColor": "hsl(212, 70%, 50%)", "fries": 191, "friesColor": "hsl(124, 70%, 50%)", "donut": 77, "donutColor": "hsl(89, 70%, 50%)" }
]

Array.prototype.groupBy = function(prop) {
    return this.reduce(function(groups, item) {
        const val = item[prop]
        groups[val] = groups[val] || []
        groups[val].push(item)
        return groups
    }, {})
}

Array.prototype.countBy = function(prop) {
    return this.reduce(function(groups, item) {
        const val = item[prop]
        groups[val] = groups[val] || 0
        groups[val] += 1
        return groups
    }, {})
}

const statuses = [
    'Submitted',
    'Pending Submission',
    'Returned to Investigator',
    'Under Review',
    'Approved for Service(s)',
    'Approved for Initial Consultation',
    'Approved for Comprehensive Consultation',
    'Ready for Initial Consultation',
    'Re-Submitted',
    'Pending Re-submission',
    'Comprehensive Complete - Grant Submitted',
    'Ready for NCATS Review',
    'Ready for Implementation',
    'No Further Network Support',
    'Not Approved',
    'Approved for Service(s) Pending Receipt of Funding',
    'On Hold',
    'Service(s) Complete',
    'Approved for Network Support',
    'Withdrawn by PI',
    'Withdrawn by PI post-award',
]

const proposalsGroupedByTicAndStatus = (props) => {
    const { proposals, colors } = props
    const proposalGroups = proposals.map((tic) => {
        return {
            name: tic.name,
            ...tic.proposals.countBy('proposal_status'),
        }
    })
    console.log(proposalGroups)
    return (
        <ResponsiveBar
            data={ proposalGroups }
            keys={ statuses }
            indexBy="name"
            margin={{
                "top": 0,
                "right": 64,
                "bottom": 0,
                "left": 100
            }}
            padding={ 0.05 }
            groupMode="stacked"
            layout="horizontal"
            height={ 600 }
            colors={ colors }
            colorBy="id"
            defs={[
                {
                    "id": "dots",
                    "type": "patternDots",
                    "background": "inherit",
                    "color": "#38bcb2",
                    "size": 4,
                    "padding": 1,
                    "stagger": true
                },
                {
                    "id": "lines",
                    "type": "patternLines",
                    "background": "inherit",
                    "color": "#eed312",
                    "rotation": -45,
                    "lineWidth": 6,
                    "spacing": 10
                }
            ]}
            fill={[
                {
                    "match": {
                        "id": "fries"
                    },
                    "id": "dots"
                },
                {
                    "match": {
                        "id": "sandwich"
                    },
                    "id": "lines"
                }
            ]}
            borderColor="inherit:darker(1.6)"
            axisBottom={ null }
            axisLeft={{
                "tickSize": 5,
                "tickPadding": 5,
                "tickRotation": 0,
                "legend": "",
                "legendPosition": "middle",
                "legendOffset": -40
            }}
            enableGridX={ false }
            enableGridY={ false }
            labelSkipWidth={ 12 }
            labelSkipHeight={ 12 }
            labelTextColor="inherit:darker(1.6)"
            animate={ true }
            motionStiffness={ 90 }
            motionDamping={ 15 }
            legends={[
                {
                    "dataFrom": "keys",
                    "anchor": "top-right",
                    "direction": "column",
                    "justify": false,
                    "translateX": 32,
                    "translateY": 0,
                    "itemsSpacing": 2,
                    "itemWidth": 300,
                    "itemHeight": 20,
                    "itemDirection": "right-to-left",
                    "itemOpacity": 0.85,
                    "symbolSize": 20,
                    "effects": [
                        {
                            "on": "hover",
                            "style": {
                                "itemOpacity": 1
                            }
                        }
                    ]
                }
            ]}
        />
    )
}

export default proposalsGroupedByTicAndStatus