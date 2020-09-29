import React, { Fragment, useContext, useEffect } from 'react'
import { Title, Paragraph } from '../../components/Typography'
import { AuthContext } from '../../contexts'

export const ExitPage = props => {
    const { logout } = useContext(AuthContext)

    useEffect(() => {
        const exit = setTimeout(logout, 2000)
        return () => clearTimeout(exit)
    }, [])

    return (
        <Fragment>
            <Title>Logging Out</Title>

            <Paragraph>
                Exiting the CTMD...
            </Paragraph>

        </Fragment>
    )
}
