﻿import React from 'react';
import TrafficTypes from 'webapp/components/TrafficTypes';
import RouteComponent from 'webapp/components/RouteComponent';
import classNames from 'classnames';
import styles from './index.scss';
import Kernel from 'world/Kernel';
import Service from 'world/Service';
import { globe } from 'webapp/components/Map';

export default class Nav extends RouteComponent {

    constructor(props) {
        super(props);
        this.fromPoi = null;
        this.toPoi = null;
        this.pageCapacity = 10;
        this.searchDistance = Kernel.REAL_EARTH_RADIUS;
        this.isFromLastFocused = true;
        this.state = {
            type: 'driving',//bus,walking
            fromPois: [],
            toPois: [],
            routes: []
        };
    }

    onCancel() {
        this.goBack();
    }

    onKeyPress(e) {
        const isFrom = e.target === this.fromInput;
        const keyword = e.target.value;
        if (e.key === "Enter") {
            if(keyword){
                this.searchPois(isFrom, keyword);
            }
        }
    }

    onFromFocus() {
        this.isFromLastFocused = true;
        this.setState({
            toPois: []
        });
    }

    onToFocus() {
        this.isFromLastFocused = false;
        this.setState({
            fromPois: []
        });
    }

    onClickFromSearchIcon(){
        this.fromInput.focus();
        const keyword = this.fromInput.value;
        if(keyword){
            this.searchPois(true, keyword);
        }
    }

    onClickToSearchIcon(){
        this.toInput.focus();
        const keyword = this.toInput.value;
        if(keyword){
            this.searchPois(false, keyword);
        }
    }

    onClickSearchIcon(isFrom, keyword) {
        if(keyword){
            this.searchPois(isFrom, keyword);
        }
    }

    searchPois(isFrom, keyword) {
        if (!keyword) {
            return;
        }
        const promise = Service.searchNearby(keyword, this.searchDistance, 'Auto', this.pageCapacity);
        this.wrapPromise(promise).then((response) => {
            let pois = null;
            if (response.detail) {
                pois = response.detail.pois;
            }
            if (!pois) {
                pois = [];
            }
            if (isFrom) {
                this.setState({
                    fromPois: pois
                });
            } else {
                this.setState({
                    toPois: pois
                });
            }
        });
    }

    onClickPoi(poi, isFromPoi) {
        if (isFromPoi) {
            this.fromPoi = poi;
            this.fromInput.value = poi.name || "";
            this.setState({
                fromPois: []
            });
            if (this.toPoi) {
                this.route(this.fromPoi, this.toPoi);
            } else {
                this.toInput.focus();
            }
        } else {
            this.toPoi = poi;
            this.toInput.value = poi.name || "";
            this.setState({
                toPois: []
            })
            if (this.fromPoi) {
                this.route(this.fromPoi, this.toPoi);
            } else {
                this.fromInput.focus();
            }
        }
    }

    onTrafficTypeChange(trafficType) {
        this.setState({
            type: trafficType
        });
        if (this.fromPoi && this.toPoi) {
            this.route(this.fromPoi, this.toPoi);
        }
    }

    route(fromPoi, toPoi) {
        if (fromPoi && toPoi) {
            this.props.router.push({
                pathname: '/nav/paths',
                state: {
                    type: this.state.type,
                    fromPoi: fromPoi,
                    toPoi: toPoi
                }
            });
        }
    }

    render() {
        const fromClassName = classNames("icon-location", styles["from-icon"]);
        const toClassName = classNames("icon-circle-empty", styles["to-icon"]);
        // const exchangeArrowClassName = classNames(fontStyles.fa, fontStyles["fa-arrows-v"]);
        const addressClassName = classNames(styles.address, "ellipsis");
        const pois = this.isFromLastFocused ? this.state.fromPois : this.state.toPois;

        return (
            <div>
                <TrafficTypes type={this.state.type} ref={input => this.trafficTypes = input} onTrafficTypeChange={e => this.onTrafficTypeChange(e)} onCancel={() => this.onCancel()} />
                <div className={styles["search-section"]}>
                    <div className={styles["inputs-container"]}>
                        <div className={classNames(styles["input-container"], styles.from)}>
                            <i className={fromClassName}></i>
                            <input type="text" placeholder="请输入出发地" ref={(input) => { this.fromInput = input; }} onFocus={(e) => this.onFromFocus(e)} onKeyPress={(e) => this.onKeyPress(e)} />
                            <i className="icon-search" onClick={() => this.onClickFromSearchIcon()}></i>
                        </div>
                        <div className={styles["input-container"]}>
                            <i className={toClassName}></i>
                            <input type="text" placeholder="请输入目的地" ref={(input) => { this.toInput = input; }} onFocus={(e) => this.onToFocus(e)} onKeyPress={(e) => this.onKeyPress(e)} />
                            <i className="icon-search" onClick={() => this.onClickToSearchIcon()}></i>
                        </div>
                    </div>
                    {/*<div className={styles.exchange}>
                        <i className={exchangeArrowClassName}></i>
                    </div>*/}
                </div>
                <div className={styles.pois}>
                    {
                        pois.map((poi) => {
                            return (
                                <div className={styles.poi} key={poi.uid} onClick={(e) => { this.onClickPoi(poi, this.isFromLastFocused); }}>
                                    <div className={styles.name}>{poi.name}</div>
                                    <div className={addressClassName}>{poi.addr}</div>
                                </div>
                            );
                        })
                    }
                </div>
            </div>
        );
    }
};