import React from 'react';
import cls from 'classnames';
import PropTypes from 'prop-types';
import BaseComponent from '../_base/baseComponent';
import { cssClasses } from '@douyinfe/semi-foundation/anchor/constants';
import LinkFoundation, { LinkAdapter } from '@douyinfe/semi-foundation/anchor/linkFoundation';
import AnchorContext from './anchor-context';
import Typography from '../typography/index';

const prefixCls = cssClasses.PREFIX;

export interface LinkProps {
    href?: string;
    title?: string | React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    disabled?: boolean;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export default class Link extends BaseComponent<LinkProps, {}> {
    static propTypes = {
        href: PropTypes.string,
        title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
        className: PropTypes.string,
        style: PropTypes.object,
    };

    static defaultProps = {
        href: '#',
        title: '',
        className: '',
    };

    static contextType = AnchorContext;

    foundation: LinkFoundation;

    constructor(props: LinkProps) {
        super(props);
        this.foundation = new LinkFoundation(this.adapter);
    }

    get adapter(): LinkAdapter {
        return {
            ...super.adapter,
            addLink: href => {
                this.context.addLink(href);
            },
            removeLink: href => {
                this.context.removeLink(href);
            },
        };
    }

    handleAddLink() {
        this.foundation.handleAddLink();
    }

    handleRemoveLink() {
        this.foundation.handleRemoveLink();
    }

    handleUpdateLink(href: string, prevHref: string) {
        this.foundation.handleUpdateLink(href, prevHref);
    }

    componentDidMount() {
        this.handleAddLink();
    }

    componentDidUpdate(prevProps: LinkProps) {
        const prevHref = prevProps.href;
        const { href } = this.props;
        this.handleUpdateLink(href, prevHref);
    }

    componentWillUnmount() {
        this.handleRemoveLink();
    }

    renderTitle = () => {
        const { href, title, disabled = false } = this.props;
        const { activeLink, showTooltip, position, size } = this.context;
        const active = activeLink === href;
        const linkTitleCls = cls(`${prefixCls}-link-tooltip`, {
            [`${prefixCls}-link-tooltip-small`]: size === 'small',
            [`${prefixCls}-link-tooltip-active`]: active,
            [`${prefixCls}-link-tooltip-disabled`]: disabled,
        });
        const toolTipOpt = position ? { position } : {};
        if (showTooltip) {
            return (
                <Typography.Text
                    size={size === 'default' ? 'normal' : 'small'}
                    ellipsis={{ showTooltip: { opts: { ...toolTipOpt } } }}
                    type={'tertiary'}
                    className={linkTitleCls}
                >
                    {title}
                </Typography.Text>
            );
        } else {
            return title;
        }
    };

    renderChildren = () => {
        const { activeLink, childMap } = this.context;
        const { href, children } = this.props;
        if (!this.context.autoCollapse) {
            return this.props.children;
        }
        return activeLink === href || (childMap[href] && childMap[href].has(activeLink)) ? children : null;
    };

    render() {
        const { href, className, style, disabled = false } = this.props;
        const { activeLink, onClick } = this.context;
        const active = activeLink === href;
        const linkCls = cls(`${prefixCls}-link`, className);
        const linkTitleCls = cls(`${prefixCls}-link-title`, {
            [`${prefixCls}-link-title-active`]: active,
            [`${prefixCls}-link-title-disabled`]: disabled,
        });

        return (
            <div className={linkCls} style={style}>
                <div className={linkTitleCls} onClick={e => !disabled && onClick(e, href)}>
                    {this.renderTitle()}
                </div>
                {this.renderChildren()}
            </div>
        );
    }
}
