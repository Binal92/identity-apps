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

import { HttpMethods } from "modules/core/src/models";
import { store } from "../../core";
import { I18nConstants } from "../../core/constants/i18n-constants";
import useRequest, {
    RequestConfigInterface,
    RequestErrorInterface,
    RequestResultInterface
} from "../../core/hooks/use-request";
import { OrganizationType } from "../../organizations/constants/organization-constants";
import { useGetCurrentOrganizationType } from "../../organizations/hooks/use-get-organization-type";
import {
    BrandingPreferenceAPIResponseInterface,
    BrandingPreferenceTypes
} from "../models/branding-preferences";

/**
 * Hook to get the branding preference from the API.
 *
 * @param name - Resource Name.
 * @param type - Resource Type.
 * @param locale - Resource Locale.
 * @returns SWR response object containing the data, error, isValidating, mutate.
 */
const useGetBrandingPreference = <Data = BrandingPreferenceAPIResponseInterface, Error = RequestErrorInterface>(
    name: string,
    type: BrandingPreferenceTypes = BrandingPreferenceTypes.ORG,
    locale: string = I18nConstants.DEFAULT_FALLBACK_LANGUAGE
): RequestResultInterface<Data, Error> => {
    const { organizationType } = useGetCurrentOrganizationType();

    const tenantDomain: string = organizationType === OrganizationType.SUBORGANIZATION
        ? store.getState()?.organization?.organization?.id
        : name;

    const requestConfig: RequestConfigInterface = {
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
        method: HttpMethods.GET,
        params: {
            locale,
            name: tenantDomain,
            type
        },
        url: store.getState().config.endpoints.brandingPreference
    };

    const { data, error, isValidating, mutate } = useRequest<Data, Error>(requestConfig, {
        shouldRetryOnError: false
    });

    return {
        data,
        error,
        isLoading: !error && !data,
        isValidating,
        mutate
    };
};

export default useGetBrandingPreference;
