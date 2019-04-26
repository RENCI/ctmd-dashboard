# Trial Innovation Center Dashboard
## API

### Disclaimer

These endpoints are subject to change often as needs arise (or unexpectedly disappear), so I'll try my best to keep these up-to-date.

A blank description is likely a sign that an endpoint (1) was set up as placeholder for some functionality that was implemented another way or (2) was used before pushing the logic to the client side and remains in place until we verify it can safely be removed. It does little harm leaving these in place, but it would be nice to clean these up one day. 


### The Endpoints


#### `/api/proposals` \[GET\]

All proposals in the database

#### `/api/proposals/by-tic` \[GET\]

All proposals grouped by assigned TIC/RIC

#### `/api/proposals/by-date` \[GET\]

objects with dates and the number of proposals with that date as their submission dates

```
[
    {
        "day": "2016-10-26",
        "value": 1
    },
    {
        "day": "2016-11-16",
        "value": 3
    },
    ...
]
```

#### `/api/proposals/by-status` \[GET\]

All proposals grouped by current status

#### `/api/proposals/by-organization` \[GET\]

All proposals grouped by submitting institution

#### `/api/proposals/by-therapeutic-area` \[GET\]

All proposals grouped by therapeutic area

#### `/api/proposals/submitted-for-services/count` \[GET\]

...

#### `/api/proposals/submitted-for-services/count/by-institution` \[GET\]

...

#### `/api/proposals/submitted-for-services/count/by-tic` \[GET\]

...

#### `/api/proposals/submitted-for-services/count/by-therapeutic-area` \[GET\]

...

#### `/api/proposals/submitted-for-services/count/by-year` \[GET\]

...

#### `/api/proposals/submitted-for-services/count/by-month` \[GET\]

...

#### `/api/proposals/resubmissions` \[GET\]

...

#### `/api/proposals/resubmissions/count` \[GET\]

...

#### `/api/proposals/resubmissions/count/by-institution` \[GET\]

...

#### `/api/proposals/resubmissions/count/by-tic` \[GET\]

...

#### `/api/proposals/resubmissions/count/by-therapeutic-area` \[GET\]

...

#### `/api/proposals/network` \[GET\]

This one is no longer used.

#### `/api/statuses` \[GET\]

All statuses coupled with their index in the `name` table

```
[
    {
        "index": 1,
        "description": "Submitted"
    },
    {
        "index": 2,
        "description": "Pending Submission"
    },
    {
        "index": 3,
        "description": "Returned to Investigator"
    },
    ...
]
```

#### `/api/organizations` \[GET\]

All organizations coupled with their index in the `name` table

```
[
    {
        "index": "1",
        "description": "Columbia University"
    },
    {
        "index": "100",
        "description": "University of California, San Diego"
    },
    {
        "index": "101",
        "description": "University of Massachusetts Medical School, Worchester"
    },
    {
        "index": "102",
        "description": "University of New Mexico Health Sciences Center"
    },
    ...
]
```

#### `/api/tics` \[GET\]

All TIC/RICs coupled with their index in the `name` table

```
[
    {
        "index": 1,
        "name": "Duke/VUMC TIC"
    },
    {
        "index": 2,
        "name": "Utah TIC"
    },
    {
        "index": 3,
        "name": "JHU/Tufts TIC"
    },
    {
        "index": 4,
        "name": "VUMC RIC"
    }
]
```

#### `/api/therapeutic-areas` \[GET\]

All therapeutic areas coupled with their index in the `name` table

```
[
    {
        "index": 1,
        "description": "Predominantly Clinical Research"
    },
    {
        "index": 2,
        "description": "Allied Health"
    },
    {
        "index": 3,
        "description": "Audiology"
    },
    ...
]
```

#### `/api/services` \[GET\]

All services as an array

```
[
    "Operationalize Standard Agreements",
    "Central IRB",
    "Standard Agreements",
    ...
]
```

#### `/api/study-metrics` \[GET\]

...

#### `/api/sites` \[GET\]

...

#### `/api/sites/reports` \[POST\]

receives lots of fields (see controller or component in frontend) to save site report
