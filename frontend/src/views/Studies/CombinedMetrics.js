import React from 'react'

export const CombinedMetrics = ({ study, studyProfile, sites }) => {

  console.log(study);
  console.log(studyProfile);
  console.log(sites.map(d => ({...d})));



  const activation = sites.reduce((sum, site) => {
    console.log({...site});
    console.log(site.protocolToFpfv);

    console.log(site.ProposalID);
    console.log(parseInt(site.protocolToFpfv, 10))
    return sum + parseInt(site.protocolToFpfv, 10)
  }, 0) / sites.length;

  console.log(activation);

  return (
    <>Yerp</>
  )
}

