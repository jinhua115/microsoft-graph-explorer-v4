import { IAction } from "../../../types/action";
import { IRequestOptions } from '../../../types/request';
import {
    GET_POLICY_ERROR,
    GET_POLICY_PENDING,
    GET_POLICY_SUCCESS,
} from "../redux-constants";

interface IPolicyValues {
    email: number,
    screenshot: number
}

export function getPoliciesSuccess(response: object): IAction {
    return {
        type: GET_POLICY_SUCCESS,
        response,
    };
}

export function getPoliciesError(response: object): IAction {
    return {
        type: GET_POLICY_ERROR,
        response,
    };
}

export function getPoliciesPending(): any {
    return {
        type: GET_POLICY_PENDING,
    };
}


// TODO: Test this function
export function getPolicies(): Function {
    return async (dispatch: Function) => {
        const policyUrl = 'https://clients.config.office.net/user/v1.0/web/policies';

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': '', //TODO: Add token
            'x-Cid': '' //TODO: Add a random GUID
        };
        const options: IRequestOptions = { headers };
        dispatch(getPoliciesPending());

        try {
            const response = await fetch(policyUrl, options);
            if (!response.ok) {
                throw response;
            }
            const res = await response.json();
            const policy = getPolicy(res);
            return dispatch(getPoliciesSuccess(policy)); // TODO: confirm if value is the correct field needed
        } catch (error) {
            return dispatch(getPoliciesError({ error }));
        }
    }
}


export function getPolicy(response: any): IPolicyValues {
    const values: IPolicyValues = {
        email: 0,
        screenshot: 0
    };
    const policies = response.value[0]?.policiesPayload;
    if (policies) {
        for (const policiesPayload of policies) {
            if (policiesPayload.settingId.includes('L_EmailCollection')) {
                values.email = policiesPayload.value;
            }
            if (policiesPayload.settingId.includes('L_Screenshot')) {
                values.screenshot = policiesPayload.value;
            }
        }
    }
    return values;
}
