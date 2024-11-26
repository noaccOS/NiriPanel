const network = await Service.import('network');
import options from 'options';
import { module } from '../../utils/module';
import { inputHandler } from 'src/components/bar/utils/helpers';
import { computeNetwork } from './computeNetwork';
import { BarBoxChild, NetstatLabelType, RateUnit } from 'src/lib/types/bar';
import Button from 'types/widgets/button';
import { NetworkResourceData } from 'src/lib/types/customModules/network';
import { NETWORK_LABEL_TYPES } from 'src/lib/types/defaults/bar';
import { GET_DEFAULT_NETSTAT_DATA } from 'src/lib/types/defaults/netstat';
import { Attribute, Child } from 'src/lib/types/widget';
import { FunctionPoller } from 'src/lib/poller/FunctionPoller';
import { Variable as TVariable } from 'types/variable';

const {
    label,
    labelType,
    networkInterface,
    rateUnit,
    dynamicIcon,
    icon,
    round,
    leftClick,
    rightClick,
    middleClick,
    pollingInterval,
} = options.bar.customModules.netstat;

export const networkUsage = Variable<NetworkResourceData>(GET_DEFAULT_NETSTAT_DATA(rateUnit.value));

const netstatPoller = new FunctionPoller<
    NetworkResourceData,
    [round: TVariable<boolean>, interfaceNameVar: TVariable<string>, dataType: TVariable<RateUnit>]
>(
    // Variable to poll and update with the result of the function passed in
    networkUsage,
    // Variables that should trigger the polling function to update when they change
    [rateUnit.bind('value'), networkInterface.bind('value'), round.bind('value')],
    // Interval at which to poll
    pollingInterval.bind('value'),
    // Function to execute to get the network data
    computeNetwork,
    // Optional parameters to pass to the function
    // round is a boolean that determines whether to round the values
    round,
    // Optional parameters to pass to the function
    // networkInterface is the interface name to filter the data
    networkInterface,
    // Optional parameters to pass to the function
    // rateUnit is the unit to display the data in
    // e.g. KiB, MiB, GiB, etc.
    rateUnit,
);

netstatPoller.initialize('netstat');

export const Netstat = (): BarBoxChild => {
    const renderNetworkLabel = (lblType: NetstatLabelType, network: NetworkResourceData): string => {
        switch (lblType) {
            case 'in':
                return `↓ ${network.in}`;
            case 'out':
                return `↑ ${network.out}`;
            default:
                return `↓ ${network.in} ↑ ${network.out}`;
        }
    };

    const netstatModule = module({
        useTextIcon: dynamicIcon.bind('value').as((useDynamicIcon) => !useDynamicIcon),
        icon: Utils.merge([network.bind('primary'), network.bind('wifi'), network.bind('wired')], (pmry, wfi, wrd) => {
            if (pmry === 'wired') {
                return wrd.icon_name;
            }
            return wfi.icon_name;
        }),
        textIcon: icon.bind('value'),
        label: Utils.merge(
            [networkUsage.bind('value'), labelType.bind('value')],
            (network: NetworkResourceData, lblTyp: NetstatLabelType) => renderNetworkLabel(lblTyp, network),
        ),
        tooltipText: labelType.bind('value').as((lblTyp) => {
            return lblTyp === 'full' ? 'Ingress / Egress' : lblTyp === 'in' ? 'Ingress' : 'Egress';
        }),
        boxClass: 'netstat',
        showLabelBinding: label.bind('value'),
        props: {
            setup: (self: Button<Child, Attribute>) => {
                inputHandler(self, {
                    onPrimaryClick: {
                        cmd: leftClick,
                    },
                    onSecondaryClick: {
                        cmd: rightClick,
                    },
                    onMiddleClick: {
                        cmd: middleClick,
                    },
                    onScrollUp: {
                        fn: () => {
                            labelType.value = NETWORK_LABEL_TYPES[
                                (NETWORK_LABEL_TYPES.indexOf(labelType.value) + 1) % NETWORK_LABEL_TYPES.length
                            ] as NetstatLabelType;
                        },
                    },
                    onScrollDown: {
                        fn: () => {
                            labelType.value = NETWORK_LABEL_TYPES[
                                (NETWORK_LABEL_TYPES.indexOf(labelType.value) - 1 + NETWORK_LABEL_TYPES.length) %
                                    NETWORK_LABEL_TYPES.length
                            ] as NetstatLabelType;
                        },
                    },
                });
            },
        },
    });

    return netstatModule;
};
