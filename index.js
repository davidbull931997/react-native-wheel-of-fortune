import React from 'react';
import PropTypes from 'prop-types';
import {
  View,
  StyleSheet,
  Text as RNText,
  Dimensions,
  Animated,
  TouchableOpacity,
  Image as RNImage,
} from 'react-native';
import * as d3Shape from 'd3-shape';

import Svg, {
  G,
  Text as SvgText,
  TSpan,
  Path,
  // Image,
  // Circle,
  // ClipPath,
  // Defs
} from 'react-native-svg';

const AnimatedSvg = Animated.createAnimatedComponent(Svg);


const { width, height } = Dimensions.get('screen');


class WheelOfFortune extends React.Component {


  constructor(props) {
    super(props);
    this.state = {
      enabled: false,
      started: false,
      finished: false,
      winner: null,
      gameScreen: new Animated.Value(width - 40),
      wheelOpacity: new Animated.Value(1),
      imageLeft: new Animated.Value((width / 2) - 30),
      imageTop: new Animated.Value((height / 2) - 70),
    };



    this.Rewards = this.props.rewards;
    this.RewardCount = this.Rewards.length

    this.numberOfSegments = this.RewardCount;
    this.fontSize = 20;
    this.oneTurn = 360;
    this.angleBySegment = this.oneTurn / this.numberOfSegments;
    this.angleOffset = this.angleBySegment / 2;
    this.winner = this.props.winner ? this.props.winner : Math.floor(Math.random() * this.numberOfSegments);

    this._wheelPaths = this.makeWheel();
    this._angle = new Animated.Value(0);
    this.angle = 0;

  }

  willreve

  getSnapshotBeforeUpdate = (prevProps, prevState) => {
    this.Rewards = prevProps.rewards;

    this.RewardCount = this.Rewards.length;

    this.numberOfSegments = this.RewardCount;

    this.winner = prevProps.winner ? prevProps.winner : Math.floor(Math.random() * this.numberOfSegments);
  }

  componentDidUpdate = (prevProps, prevState, snapshot) => {

  }

  componentDidMount() {
    this._angle.addListener(event => {
      if (this.state.enabled) {
        this.setState({
          enabled: false,
          finished: false
        });
      }

      this.angle = event.value;
    });
  }

  makeWheel = () => {
    const data = Array.from({ length: this.numberOfSegments }).fill(1);
    const arcs = d3Shape.pie()(data);
    const { colors, innerRadius } = this.props;
    return arcs.map((arc, index) => {
      const instance = d3Shape
        .arc()
        .padAngle(0.01)
        .outerRadius(width / 2)
        .innerRadius(innerRadius);
      return {
        path: instance(arc),
        color: colors[index % colors.length],
        value: this.Rewards[index],
        centroid: instance.centroid(arc)
      };
    });
  };

  _getwinnerIndex = () => {
    const deg = Math.abs(Math.round(this.angle % this.oneTurn));
    // wheel turning counterclockwise
    if (this.angle < 0) {
      return Math.floor(deg / this.angleBySegment);
    }
    // wheel turning clockwise
    return (this.numberOfSegments - Math.floor(deg / this.angleBySegment)) % this.numberOfSegments;

  };

  _onPress = () => {

    const { duration } = this.props;

    this.setState({
      started: true
    })

    const toValue = 365 - ((this.winner) * (this.oneTurn / this.numberOfSegments)) + (360 * (duration / 1000));

    console.log(toValue);

    Animated.timing(this._angle, {
      toValue,
      duration,
      useNativeDriver: true
    }).start(() => {
      const winnerIndex = this._getwinnerIndex();
      this.setState({
        finished: true,
        winner: this._wheelPaths[winnerIndex].value
      });
      this.props.getWinner(this._wheelPaths[winnerIndex].value, winnerIndex)
    });

  };

  _textRender = (x, y, value, size, i) => {
    const { textColor } = this.props;

    return (
      <SvgText
        x={x}
        y={y - 70}
        fill={textColor}
        textAnchor="middle"
        fontSize={this.fontSize}
      >
        {Array.from({ length: number.length }).map((_, j) => {
          return (
            <TSpan
              x={x}
              dy={this.fontSize}
              key={`arc-${i}-slice-${j}`}
            >

              {number.charAt(j)}
            </TSpan>
          );
        })}
      </SvgText>
    )
  }



  _renderSvgWheel = () => {
    const { textColor, borderColor, borderWidth, backgroundColor } = this.props;

    return (
      <View style={styles.container}>
        {this._renderKnob()}
        <Animated.View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            transform: [
              {
                rotate: this._angle.interpolate({
                  inputRange: [-this.oneTurn, 0, this.oneTurn],
                  outputRange: [`-${this.oneTurn}deg`, `0deg`, `${this.oneTurn}deg`]
                })
              },

            ],
            backgroundColor,
            width: width - 20,
            height: width - 20,
            borderRadius: (width - 20) / 2,
            borderWidth,
            borderColor,
            opacity: this.state.wheelOpacity
          }}
        >

          <AnimatedSvg
            width={this.state.gameScreen}
            height={this.state.gameScreen}
            viewBox={`0 0 ${width} ${width}`}
            style={{ transform: [{ rotate: `-${this.angleOffset}deg` }], margin: 10, }}
          >

            <G y={width / 2} x={width / 2}>
              {this._wheelPaths.map((arc, i) => {
                const [x, y] = arc.centroid;
                const number = arc.value.toString();

                return (
                  <G key={`arc-${i}`}>

                    <Path d={arc.path} strokeWidth={2} fill={arc.color} />
                    <G
                      rotation={(i * this.oneTurn) / this.numberOfSegments + this.angleOffset}
                      origin={`${x}, ${y}`}
                    >

                      <SvgText
                        x={x}
                        y={y - 50}
                        fill={textColor}
                        textAnchor="middle"
                        fontSize={this.fontSize}
                      >
                        {Array.from({ length: number.length }).map((_, j) => {
                          return (
                            <TSpan
                              x={x}
                              dy={this.fontSize}
                              key={`arc-${i}-slice-${j}`}
                            >

                              {number.charAt(j)}
                            </TSpan>
                          );
                        })}
                      </SvgText>
                    </G>
                  </G>
                );
              })}
            </G>
          </AnimatedSvg>
        </Animated.View>
      </View>
    );
  };


  _renderKnob = () => {
    const { knobSize, knoobSource } = this.props;
    // [0, this.numberOfSegments]
    const YOLO = Animated.modulo(
      Animated.divide(
        Animated.modulo(Animated.subtract(this._angle, this.angleOffset), this.oneTurn),
        new Animated.Value(this.angleBySegment)
      ),
      1
    );

    return (
      <Animated.View
        style={{
          width: knobSize,
          height: knobSize * 2,
          justifyContent: 'flex-end',
          zIndex: 1,
          opacity: this.state.wheelOpacity,
          transform: [
            {
              rotate: YOLO.interpolate({
                inputRange: [-1, -0.5, -0.0001, 0.0001, 0.5, 1],
                outputRange: ['0deg', '0deg', '35deg', '-35deg', '0deg', '0deg']
              })
            }
          ]
        }}
      >
        <Svg
          width={knobSize}
          height={(knobSize * 100) / 57}
          viewBox={`0 0 57 100`}
          style={{ transform: [{ translateY: 8 }] }}
        >
          <RNImage
            source={knoobSource}
            style={{ width: knobSize, height: (knobSize * 100) / 57 }}
          />
        </Svg>
      </Animated.View>
    );
  };

  _renderTopToPlay() {

    if (this.state.started == false) {
      const { startText } = this.props;
      if (this.props.playButton) {
        return (
          <TouchableOpacity onPress={() => this._onPress()}>
            {this.props.playButton()}
          </TouchableOpacity>
        );
      } else {
        return (
          <View style={styles.modal}>
            <TouchableOpacity onPress={() => this._onPress()}>
              <RNText style={styles.startText}>{startText}</RNText>
            </TouchableOpacity>
          </View>
        );
      }
    }
  }

  render() {
    return (
      <View style={styles.container}>

        { /** SVG WHEEL  */}
        <TouchableOpacity style={{ position: 'absolute', width: width, height: height / 2, justifyContent: 'center', alignItems: 'center' }}>
          <Animated.View style={[styles.content, { padding: 10 }]}>
            {this._renderSvgWheel()}
          </Animated.View>
        </TouchableOpacity>

      </View>
    );
  }
}

WheelOfFortune.propTypes = {
  rewards: PropTypes.instanceOf(Array).isRequired,
  getWinner: PropTypes.func.isRequired,
  winner: PropTypes.number,
  duration: PropTypes.number,
  colors: PropTypes.instanceOf(Array),
  backgroundColor: PropTypes.string,
  borderWidth: PropTypes.number,
  knobSize: PropTypes.number,
  borderColor: PropTypes.string,
  textColor: PropTypes.string,
  knoobSource: PropTypes.number,
  innerRadius: PropTypes.number,
  playButton: PropTypes.func,
  startText: PropTypes.string,
}

WheelOfFortune.defaultProps = {
  winner: null,
  duration: 10000,
  backgroundColor: '#FFFFFF',
  borderWidth: 2,
  knobSize: 20,
  borderColor: '#FFFFFF',
  textColor: '#FFFFFF',
  knoobSource: require('../assets/images/knoob.png'),
  playButton: null,
  startText: 'TAPTOPLAY',
  innerRadius: 100,
  colors: ['#E07026', '#E8C22E', '#ABC937', '#4F991D', '#22AFD3', '#5858D0', '#7B48C8', '#D843B9', '#E23B80', '#D82B2B'],
};

export default WheelOfFortune;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  content: {
  },
  startText: {
    fontSize: 50,
    color: '#fff',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10

  }
});

