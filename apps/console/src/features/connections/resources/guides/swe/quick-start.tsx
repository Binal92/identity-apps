/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com).
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import {
    VerticalStepper,
    VerticalStepperStepInterface
} from "@wso2is/common/src";
import { hasRequiredScopes } from "@wso2is/core/helpers";
import { AlertLevels, IdentifiableComponentInterface } from "@wso2is/core/models";
import { addAlert } from "@wso2is/core/store";
import { GenericIcon, Heading, Link, LinkButton, ListLayout, PageHeader, Text } from "@wso2is/react-components";
import React, { FunctionComponent, MouseEvent, ReactElement, useEffect, useMemo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch } from "redux";
import { DropdownProps, Grid, Modal, PaginationProps } from "semantic-ui-react";
import BuildLoginFlowStep01Illustration from "./assets/build-login-flow-01.png";
import BuildLoginFlowStep02Illustration from "./assets/build-login-flow-02.png";
import BuildLoginFlowStep03Illustration from "./assets/build-login-flow-03.png";
import { useApplicationList } from "../../../../../features/applications/api";
import { ApplicationList } from "../../../../../features/applications/components/application-list";
import {
    ConnectionInterface,
    ConnectionTemplateInterface
} from "../../../../../features/connections/models/connection";
import { AdvancedSearchWithBasicFilters } from "../../../../../features/core/components";
import { AppConstants } from "../../../../../features/core/constants";
import { history } from "../../../../../features/core/helpers";
import { FeatureConfigInterface } from "../../../../core/models";
import { AppState } from "../../../../core/store";

/**
 * Prop types of the component.
 */
interface SIWEAuthenticationProviderQuickStartPropsInterface extends IdentifiableComponentInterface {
    /**
     * IdP Object.
     */
    identityProvider: ConnectionInterface;
    /**
     * IdP Template.
     */
    template: ConnectionTemplateInterface;
}

const ITEMS_PER_PAGE: number = 6;

/**
 * Quick start content for the SIWEAuthenticationProvider IDP template.
 *
 * @param props - Props injected into the component.
 * @returns SIWEAuthenticationProvider IDP template quick start component.
 */
const SIWEAuthenticationProviderQuickStart: FunctionComponent<SIWEAuthenticationProviderQuickStartPropsInterface> = (
    props: SIWEAuthenticationProviderQuickStartPropsInterface
): ReactElement => {

    const {
        [ "data-componentid" ]: componentId
    } = props;

    const { t } = useTranslation();

    const dispatch: Dispatch = useDispatch();

    const [ showApplicationModal, setShowApplicationModal ] = useState<boolean>(false);
    const [ listOffset, setListOffset ] = useState<number>(0);
    const [ listItemLimit, setListItemLimit ] = useState<number>(ITEMS_PER_PAGE);
    const [ searchQuery, setSearchQuery ] = useState<string>("");
    const [ triggerClearQuery, setTriggerClearQuery ] = useState<boolean>(false);

    const featureConfig: FeatureConfigInterface = useSelector((state: AppState) => state.config.ui.features);
    const allowedScopes: string = useSelector((state: AppState) => state?.auth?.allowedScopes);

    const isApplicationReadAccessAllowed: boolean = useMemo(() => (
        hasRequiredScopes(
            featureConfig?.applications, featureConfig?.applications?.scopes?.read, allowedScopes)
    ), [ featureConfig, allowedScopes ]);

    const {
        data: applicationList,
        isLoading: isApplicationListFetchRequestLoading,
        error: applicationListFetchRequestError
    } = useApplicationList(null, listItemLimit, listOffset, searchQuery, isApplicationReadAccessAllowed);

    /**
     * Handles the application list fetch request error.
     */
    useEffect(() => {

        if (!applicationListFetchRequestError) {
            return;
        }

        if (applicationListFetchRequestError.response
            && applicationListFetchRequestError.response.data
            && applicationListFetchRequestError.response.data.description) {
            dispatch(addAlert({
                description: applicationListFetchRequestError.response.data.description,
                level: AlertLevels.ERROR,
                message: t("console:develop.features.applications.notifications.fetchApplications" +
                    ".error.message")
            }));

            return;
        }

        dispatch(addAlert({
            description: t("console:develop.features.applications.notifications.fetchApplications" +
                ".genericError.description"),
            level: AlertLevels.ERROR,
            message: t("console:develop.features.applications.notifications.fetchApplications." +
                "genericError.message")
        }));
    }, [ applicationListFetchRequestError ]);

    /**
     * Handles per page dropdown page.
     *
     * @param event - Mouse event.
     * @param data - Dropdown data.
     */
    const handleItemsPerPageDropdownChange = (event: MouseEvent<HTMLAnchorElement>, data: DropdownProps): void => {

        setListItemLimit(data.value as number);
    };

    /**
     * Handles the pagination change.
     *
     * @param event - Mouse event.
     * @param data - Pagination component data.
     */
    const handlePaginationChange = (event: MouseEvent<HTMLAnchorElement>, data: PaginationProps): void => {

        setListOffset((data.activePage as number - 1) * listItemLimit);
    };

    /**
     * Handles the `onFilter` callback action from the
     * application search component.
     *
     * @param query - Search query.
     */
    const handleApplicationFilter = (query: string): void => {

        setSearchQuery(query);

        if (query === "") {
            setSearchQuery(null);
        } else {
            setSearchQuery(query);
        }
    };

    /**
     * Handles the `onSearchQueryClear` callback action.
     */
    const handleSearchQueryClear = (): void => {

        setSearchQuery("");
        setTriggerClearQuery(!triggerClearQuery);
    };

    /**
     * Vertical Stepper steps.
     * @returns List of steps.
     */
    const steps: VerticalStepperStepInterface[] = [
        {
            stepContent: (
                <>
                    <Text>
                        <Trans
                            i18nKey={
                                "extensions:develop.identityProviders.siwe.quickStart.steps.selectApplication.content"
                            }
                        >
                            Choose the { isApplicationReadAccessAllowed ? (
                                <Link external={ false } onClick={ () => setShowApplicationModal(true) }>
                                application </Link>) : "application" }
                            for which you want to set up Sign In With Ethereum.
                        </Trans>
                    </Text>
                </>
            ),
            stepTitle: t("extensions:develop.identityProviders.siwe.quickStart.steps.selectApplication.heading")
        },
        {
            stepContent: (
                <>
                    <Text>
                        <Trans
                            i18nKey={
                                "extensions:develop.identityProviders.siwe.quickStart.steps.selectDefaultConfig" +
                                ".content"
                            }
                        >
                            Go to <strong>Login Flow</strong> tab and click on the <strong>Add Sign In Option</strong>
                            button inside the login box. And select a Sign In With Ethereum connection.
                        </Trans>
                    </Text>
                    <GenericIcon inline transparent icon={ BuildLoginFlowStep01Illustration } size="huge"/>
                    <GenericIcon inline transparent icon={ BuildLoginFlowStep02Illustration } size="huge"/>
                    <GenericIcon inline transparent icon={ BuildLoginFlowStep03Illustration } size="huge"/>
                </>
            ),
            stepTitle: (
                <Trans i18nKey="extensions:develop.identityProviders.siwe.quickStart.steps.selectDefaultConfig.heading">
                    Add a <strong>Sign In With Ethereum</strong> connection
                </Trans>
            )
        }
    ];

    return (
        <>
            <Grid data-testid={ componentId } className="authenticator-quickstart-content">
                <Grid.Row textAlign="left">
                    <Grid.Column width={ 16 }>
                        <PageHeader
                            className="mb-2"
                            title={ t("extensions:develop.identityProviders.siwe.quickStart.heading") }
                            imageSpaced={ false }
                            bottomMargin={ false }
                        />
                        <Heading subHeading as="h6">
                            { t("extensions:develop.identityProviders.siwe.quickStart.subHeading") }
                        </Heading>
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row textAlign="left">
                    <Grid.Column width={ 16 }>
                        <VerticalStepper
                            alwaysOpen
                            isSidePanelOpen
                            stepContent={ steps }
                            isNextEnabled={ true }
                        />
                    </Grid.Column>
                </Grid.Row>
            </Grid>
            {
                showApplicationModal && (
                    <Modal
                        data-testid={ componentId }
                        open={ true }
                        className="wizard application-create-wizard"
                        dimmer="blurring"
                        size="large"
                        onClose={ () => setShowApplicationModal(false) }
                        closeOnDimmerClick={ false }
                        closeOnEscape
                    >
                        <Modal.Header className="wizard-header">
                            { t("extensions:develop.identityProviders.siwe.quickStart.addLoginModal.heading") }
                            <Heading as="h6">
                                {
                                    t("extensions:develop.identityProviders.siwe.quickStart." +
                                    "addLoginModal.subHeading")
                                }
                            </Heading>
                        </Modal.Header>
                        <Modal.Content className="content-container" scrolling>
                            <ListLayout
                                advancedSearch={ (
                                    <AdvancedSearchWithBasicFilters
                                        onFilter={ handleApplicationFilter }
                                        filterAttributeOptions={ [
                                            {
                                                key: 0,
                                                text: t("common:name"),
                                                value: "name"
                                            }
                                        ] }
                                        filterAttributePlaceholder={
                                            t("console:develop.features.applications.advancedSearch.form." +
                                            "inputs.filterAttribute.placeholder")
                                        }
                                        filterConditionsPlaceholder={
                                            t("console:develop.features.applications.advancedSearch.form." +
                                            "inputs.filterCondition.placeholder")
                                        }
                                        filterValuePlaceholder={
                                            t("console:develop.features.applications.advancedSearch.form." +
                                            "inputs.filterValue.placeholder")
                                        }
                                        placeholder={ t("console:develop.features.applications." +
                                        "advancedSearch.placeholder") }
                                        defaultSearchAttribute="name"
                                        defaultSearchOperator="co"
                                        triggerClearQuery={ triggerClearQuery }
                                        data-testid={ `${ componentId }-list-advanced-search` }
                                    />
                                ) }
                                currentListSize={ applicationList?.count }
                                listItemLimit={ listItemLimit }
                                onItemsPerPageDropdownChange={ handleItemsPerPageDropdownChange }
                                onPageChange={ handlePaginationChange }
                                showPagination={ applicationList?.totalResults > listItemLimit }
                                totalPages={ Math.ceil(applicationList?.totalResults / listItemLimit) }
                                totalListSize={ applicationList?.totalResults }
                                data-testid={ `${ componentId }-list-layout` }
                                showTopActionPanel={ applicationList?.totalResults > listItemLimit }
                                paginationOptions={ {
                                    itemsPerPageDropdownLowerLimit: ITEMS_PER_PAGE
                                } }
                            >
                                <ApplicationList
                                    isSetStrongerAuth
                                    list={ applicationList }
                                    onEmptyListPlaceholderActionClick={
                                        () => history.push(
                                            AppConstants.getPaths().get("APPLICATION_TEMPLATES")
                                        )
                                    }
                                    onSearchQueryClear={ handleSearchQueryClear }
                                    searchQuery={ searchQuery }
                                    isLoading={ isApplicationListFetchRequestLoading }
                                    isRenderedOnPortal={ true }
                                    data-testid={ `${ componentId }-list` }
                                />
                            </ListLayout>
                        </Modal.Content>
                        <Modal.Actions>
                            <Grid>
                                <Grid.Row column={ 1 }>
                                    <Grid.Column mobile={ 8 } tablet={ 8 } computer={ 8 }>
                                        <LinkButton
                                            data-testid={ `${ componentId }-cancel-button` }
                                            floated="left"
                                            onClick={ () => setShowApplicationModal(false) }
                                        >
                                            { t("common:cancel") }
                                        </LinkButton>
                                    </Grid.Column>
                                </Grid.Row>
                            </Grid>
                        </Modal.Actions>
                    </Modal>
                )
            }
        </>
    );
};

/**
 * Default props for the component
 */
SIWEAuthenticationProviderQuickStart.defaultProps = {
    "data-componentid": "swe-idp-quick-start"
};

/**
 * A default export was added to support React.lazy.
 * TODO: Change this to a named export once react starts supporting named exports for code splitting.
 * @see {@link https://reactjs.org/docs/code-splitting.html#reactlazy}
 */
export default SIWEAuthenticationProviderQuickStart;
