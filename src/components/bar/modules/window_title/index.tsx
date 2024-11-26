import { runAsyncCommand, throttledScrollHandler } from 'src/components/bar/utils/helpers';
import { BarBoxChild } from 'src/lib/types/bar';
import { GtkWidget } from 'src/lib/types/widget';
import options from 'src/options';
import { hyprland } from 'src/lib/constants/hyprland';
import AstalHyprland from 'gi://AstalHyprland?version=0.1';
import { useHook } from 'src/lib/shared/hookHandler';
import {
    connectMiddleClick,
    connectPrimaryClick,
    connectScroll,
    connectSecondaryClick,
} from 'src/lib/shared/eventHandlers';
import { bind, Variable } from 'astal';
import { getTitle, getWindowMatch, truncateTitle } from './helpers/title';

const { leftClick, rightClick, middleClick, scrollDown, scrollUp } = options.bar.windowtitle;

const ClientTitle = (): BarBoxChild => {
    const { custom_title, class_name, label, icon, truncation, truncation_size } = options.bar.windowtitle;

    const componentClassName = Variable.derive(
        [options.theme.bar.buttons.style.bind(), label.bind()],
        (style: string, showLabel: boolean) => {
            const styleMap: Record<string, string> = {
                default: 'style1',
                split: 'style2',
                wave: 'style3',
                wave2: 'style3',
            };
            return `windowtitle-container ${styleMap[style]} ${!showLabel ? 'no-label' : ''}`;
        },
    );

    const componentChildren = Variable.derive(
        [
            bind(hyprland, 'focusedClient'),
            bind(custom_title),
            bind(class_name),
            bind(label),
            bind(icon),
            bind(truncation),
            bind(truncation_size),
        ],
        (
            client: AstalHyprland.Client,
            useCustomTitle: boolean,
            useClassName: boolean,
            showLabel: boolean,
            showIcon: boolean,
            truncate: boolean,
            truncationSize: number,
        ) => {
            const children: GtkWidget[] = [];

            if (showIcon) {
                children.push(
                    <label
                        className={'bar-button-icon windowtitle txt-icon bar'}
                        label={getWindowMatch(client).icon}
                    />,
                );
            }

            if (showLabel) {
                children.push(
                    <label
                        className={`bar-button-label windowtitle ${showIcon ? '' : 'no-icon'}`}
                        label={truncateTitle(
                            getTitle(client, useCustomTitle, useClassName),
                            truncate ? truncationSize : -1,
                        )}
                    />,
                );
            }

            return children;
        },
    );

    const component = <box className={componentClassName()}>{componentChildren()}</box>;

    return {
        component,
        isVisible: true,
        boxClass: 'windowtitle',
        props: {
            setup: (self: GtkWidget): void => {
                useHook(self, options.bar.scrollSpeed, () => {
                    const throttledHandler = throttledScrollHandler(options.bar.scrollSpeed.value);

                    const disconnectPrimary = connectPrimaryClick(self, (clicked, event) => {
                        runAsyncCommand(leftClick.value, { clicked, event });
                    });

                    const disconnectSecondary = connectSecondaryClick(self, (clicked, event) => {
                        runAsyncCommand(rightClick.value, { clicked, event });
                    });

                    const disconnectMiddle = connectMiddleClick(self, (clicked, event) => {
                        runAsyncCommand(middleClick.value, { clicked, event });
                    });

                    const disconnectScroll = connectScroll(self, throttledHandler, scrollUp.value, scrollDown.value);

                    return (): void => {
                        disconnectPrimary();
                        disconnectSecondary();
                        disconnectMiddle();
                        disconnectScroll();
                    };
                });
            },
        },
    };
};

export { ClientTitle };
