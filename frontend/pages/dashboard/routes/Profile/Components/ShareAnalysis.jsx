import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import cx from 'classnames';
import Chart from 'chart.js';
import Clipboard from 'clipboard';
import { bindActionCreators } from 'redux';
import objectAssign from 'object-assign';

import Loading from 'COMPONENTS/Loading';
import IconButton from 'COMPONENTS/IconButton';
import Input from 'COMPONENTS/Input';
import ChartInfo from 'COMPONENTS/ChartInfo';
import Tipso from 'COMPONENTS/Tipso';

import { LINECHART_CONFIG } from 'UTILS/const_value';
import { GREEN_COLORS } from 'UTILS/colors';
import dateHelper from 'UTILS/date';
import WECHAT from 'SRC/data/wechat';
import styles from '../styles/profile.css';

const WECHAT_FROM = Object.keys(WECHAT);

class ShareAnalysis extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showQrcodeModal: false
    };
    this.qrcode = null;
    this.pageViewsChart = null;
    this.viewDevicesChart = null;
    this.viewSourcesChart = null;
    this.copyUrl = this.copyUrl.bind(this);
    this.onMouseOut = this.onMouseOut.bind(this);
    this.onMouseOver = this.onMouseOver.bind(this);
  }

  componentDidMount() {
    const { actions, index } = this.props;
    actions.fetchShareData();
    new Clipboard(`#copyLinkButton-${index}`, {
      text: () => $(`#shareGithubUrl-${index}`).val()
    });
  }

  componentDidUpdate() {
    const { loading } = this.props;
    if (loading) { return }
    !this.pageViewsChart && this.renderViewsChart();
    !this.viewDevicesChart && this.renderDevicesChart();
    !this.viewSourcesChart && this.renderSourcesChart();
    !this.qrcode && this.renderQrcode();
  }

  onMouseOut() {
    this.setState({ showQrcodeModal: false });
  }

  onMouseOver() {
    this.setState({ showQrcodeModal: true });
  }

  copyUrl() {
    const { index } = this.props;
    document.querySelector(`#shareGithubUrl-${index}`).select();
  }

  renderShareController() {
    const { showQrcodeModal } = this.state;
    const { actions, info, index, text } = this.props;
    const { url } = info;
    return (
      <div className={styles["share_controller"]}>
        <div
          onMouseEnter={this.onMouseOver}
          onMouseLeave={this.onMouseOut}
          onMouseOver={this.onMouseOver}
          onMouseOut={this.onMouseOut}
          className={styles["share_container"]}>
          <Tipso
            show={showQrcodeModal}>
            <div className={styles["qrcode_container"]}>
              <div id={`qrcode-${index}`}></div>
              <span>扫码分享{text}</span>
            </div>
          </Tipso>
          <Input
            id={`shareGithubUrl-${index}`}
            style="flat"
            value={`${window.location.origin}/${url}`}
          />
          <IconButton
            icon="clipboard"
            id={`copyLinkButton-${index}`}
            onClick={this.copyUrl.bind(this)}
          />
        </div>
      </div>
    )
  }

  renderViewsChart() {
    const { pageViews } = this.props;
    const viewsChart = ReactDOM.findDOMNode(this.pageViews);
    const validatePageViews = [];
    pageViews.forEach((pageView) => {
      const { count, date } = pageView;
      const filterPageViews = validatePageViews.filter(validatePageView => validatePageView.date === date);
      if(filterPageViews.length) {
        filterPageViews[0].count += count;
      } else {
        validatePageViews.push({
          count,
          date
        });
      }
    });
    const dateLabels = validatePageViews.map((pageView) => {
      const { date } = pageView;
      return `${dateHelper.validator.fullDate(date)} ${dateHelper.validator.hour(date)}:00`;
    });
    const viewDates = validatePageViews.map(pageView => pageView.count);
    const datasetsConfig = {
      data: viewDates,
      label: '每小时浏览量'
    };
    if (viewDates.length >= 20) {
      datasetsConfig.pointBorderWidth = 0;
      datasetsConfig.pointRadius = 0;
    }
    this.pageViewsChart = new Chart(viewsChart, {
      type: 'line',
      data: {
        labels: dateLabels,
        datasets: [objectAssign({}, LINECHART_CONFIG, datasetsConfig)]
      },
      options: {
        scales: {
          xAxes: [{
            display: false,
            gridLines: {
              display: false
            }
          }],
          yAxes: [{
            gridLines: {
              display: false
            },
            ticks: {
              beginAtZero:true
            }
          }],
        },
        tooltips: {
          callbacks: {
            title: (item, data) => {
              return item[0].xLabel
            },
            label: (item, data) => {
              return `浏览量：${item.yLabel} PV`
            }
          }
        }
      }
    })
  }

  renderQrcode() {
    const { info, index } = this.props;
    const { url } = info;
    const qrcodeId = `qrcode-${index}`;
    $(`#${qrcodeId}`).empty();
    this.qrcode = new QRCode(document.getElementById(qrcodeId), {
      text: `${window.location.origin}/${url}`,
      width: 120,
      height: 120,
      colorDark: GREEN_COLORS[1],
      colorLight : "#ffffff",
      correctLevel : QRCode.CorrectLevel.H
    });
  }

  renderDevicesChart() {
    const { viewDevices } = this.props;
    const viewDevicesChart = ReactDOM.findDOMNode(this.viewDevices);
    const labels = viewDevices.map(viewDevice => viewDevice.platform);
    const datas = viewDevices.map(viewDevice => viewDevice.count);
    this.viewDevicesChart = new Chart(viewDevicesChart, {
      type: 'radar',
      data: {
        labels,
        datasets: [{
          data: datas,
          label: '',
          fill: true,
          backgroundColor: GREEN_COLORS[4],
          borderWidth: 1,
          borderColor: GREEN_COLORS[0],
          pointBackgroundColor: GREEN_COLORS[0],
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: GREEN_COLORS[0]
        }]
      },
      options: {
        title: {
          display: true,
          text: '浏览量来源平台'
        },
        legend: {
          display: false,
        }
      }
    });
  }

  renderSourcesChart() {
    const { viewSources } = this.props;
    const viewSourcesChart = ReactDOM.findDOMNode(this.viewSources);
    const labels = viewSources.map(viewSource => viewSource.browser);
    const datas = viewSources.map(viewSource => viewSource.count);

    this.viewSourcesChart = new Chart(viewSourcesChart, {
      type: 'radar',
      data: {
        labels,
        datasets: [{
          data: datas,
          label: '',
          fill: true,
          backgroundColor: GREEN_COLORS[4],
          borderWidth: 1,
          borderColor: GREEN_COLORS[0],
          pointBackgroundColor: GREEN_COLORS[0],
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: GREEN_COLORS[0]
        }]
      },
      options: {
        title: {
          display: true,
          text: '浏览器分布'
        },
        legend: {
          display: false,
        }
      }
    });
  }

  renderChartInfo() {
    const { pageViews, viewDevices, viewSources } = this.props;
    const viewCount = pageViews.reduce((prev, current, index) => {
      if (index === 0) {
        return current.count;
      }
      return current.count + prev;
    }, '');
    const maxPlatformCount = Math.max(...viewDevices.map(viewDevice => viewDevice.count));
    const platforms = viewDevices
      .filter(viewDevice => viewDevice.count === maxPlatformCount)
      .map(viewDevice => viewDevice.platform);

    const maxBrowserCount = Math.max(...viewSources.map(viewSource => viewSource.count));
    const browsers = viewSources
      .filter(viewSource => viewSource.count === maxBrowserCount)
      .map(viewSource => viewSource.browser);

    return (
      <div className={styles["chart_info_container"]}>
        <ChartInfo
          mainText={viewCount}
          subText="总 PV"
        />
        <ChartInfo
          mainText={platforms.slice(0, 2).join(',')}
          subText="使用最多的平台"
        />
        <ChartInfo
          mainText={browsers.join(',')}
          subText="使用最多的浏览器"
        />
      </div>
    )
  }

  render() {
    const { actions, loading, info, title } = this.props;
    const controllerClass = cx(
      styles["share_controller_card"],
      !info.openShare && styles["disabled"]
    );
    return (
      <div className={styles["card_container"]}>
        {loading ? '' : (
          <div className={controllerClass}>
            {this.renderShareController()}
          </div>
        )}
        {loading ? (<Loading />) : (
          <div className={styles["card"]}>
            {this.renderChartInfo()}
            <div className={styles["chart_container"]}>
              <div className={styles["radar_chart"]}>
                <canvas ref={ref => this.viewDevices = ref}></canvas>
              </div>
              <div className={styles["radar_chart"]}>
                <canvas ref={ref => this.viewSources = ref}></canvas>
              </div>
            </div>
            <div className={cx(styles["chart_container"], styles["pageview_chart_container"])}>
              <canvas ref={ref => this.pageViews = ref}/>
            </div>
          </div>
        )}
      </div>
    )
  }
}

ShareAnalysis.propTypes = {
  index: PropTypes.oneOfType([ PropTypes.number, PropTypes.string ]),
  loading: PropTypes.bool,
  title: PropTypes.element,
  text: PropTypes.string,
  info: PropTypes.object,
  actions: PropTypes.object,
  pageViews: PropTypes.array,
  viewDevices: PropTypes.array,
  viewSources: PropTypes.array
};

ShareAnalysis.defaultProps = {
  index: 0,
  loading: true,
  title: (<p></p>),
  text: '',
  info: {
    openShare: false,
    url: ''
  },
  actions: {},
  pageViews: [],
  viewDevices: [],
  viewSources: []
};

export default ShareAnalysis;
