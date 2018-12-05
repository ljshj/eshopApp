import React from 'react';
import { connect } from 'react-redux';
import {
  TouchableNativeFeedback,
  StyleSheet,
  Platform,
  Modal,
  CheckBox
} from 'react-native';
import {
  Container,
  Footer,
  Content,
  View,
  Text,
  Form,
  Item,
  Label,
  Input,
  Toast,
  Spinner,

} from 'native-base';
import {
  RED_COLOR, RE_PHONE
} from '../../constants';
import AddressPicker from '../../components/AddressPicker';
import {
  createAddress
} from '../../actions';
import addressService from '../../services/addressService';

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#fff'
  },
  footer: {
    height: 50,
    alignItems: 'center',
    backgroundColor: RED_COLOR
  },
  footerContent: {
    color: '#fff',
    fontSize: 18
  }
})

@connect(
  state => ({
    userId: state.auth.user.userId,
    token: state.auth.user.token,
    isAuthorized: state.auth.isAuthorized,
  })
)
export default class AddressUpdate extends React.Component {
  static navigationOptions = ({navigation}) => ({
    title: '修改地址信息'
  })

  state = {
    modalVisible: false,
  }

  constructor(props) {
    super(props)

    this.state.form = this.props.navigation.state.params ?
      this.props.navigation.state.params.form || {
        consignee: "",
        phone: "",
        city: "",
        address: "",
        streetNumber: "",
        isDefautl: false
      } : {
        consignee: "",
        phone: "",
        city: "",
        address: "",
        streetNumber: "",
        isDefautl: false
      }
  }

  /**
   * addressPicker open event
   *
   * @memberof AddressPostForm
   */
  handleModalShow = () => {
    this.setState({
      modalVisible: true
    })
  }

  /**
   * adressPicker close event
   *
   * @memberof AddressPostForm
   */
  handleAddressModalClose = () => {
    this.setState({
      modalVisible: false
    })
  }

  /**
   * addressPicker select event
   *
   * @memberof AddressPostForm
   */
  handleModalSelect = (value) => {
    this.setState({
      modalVisible: false,
      form: {
        ...this.state.form,
        city: value
      }
    })
  }

  /**
   * 改变isDefault
   *
   * @memberof AddressPostForm
   */
  handleIsDefaultChange = () => {
    this.setState({
      form: {
        ...this.state.form,
        isDefault: !this.state.form.isDefault
      }
    })
  }

  /**
   * 改变form的值
   *
   * @memberof AddressPostForm
   */
  handleValueChange = (value) => {
    this.setState({
      form: {
        ...this.state.form,
        ...value
      }
    })
  }

  handleSubmit = async () => {
    const {
      userId,
      token,
      navigation,
      isAuthorized,
      createAddress
    } = this.props
    const form = this.state.form
    if (!isAuthorized) {
      navigation.navigate('Signin', { from: 'PostAddress', params: {
        form: form
      }})
    } else {
      if(!this.validate()) {
        return ;
      }

      const phone = parseInt(form.phone, 10)

      try {
        const res = await addressService.update(userId, token, {
          ...form,
          phone
        })

        this.showToast('修改地址信息成功', 'success')

        navigation.navigate('Address')
      } catch (err) {
        this.showToast(err.response.data.message , 'danger')
      }
    }
  }

  validate = () => {
    const {
      form
    } = this.state

    if (form.consignee === "") {
      this.showToast('请输入正确的收货人姓名')
      return false
    }

    if (!RE_PHONE.test(form.phone)) {
      this.showToast('请输入正确的手机号码')
      return false
    }

    if (form.city === "") {
      this.showToast('请选择城市')
      return false
    }

    if (form.address === "") {
      this.showToast('请输入正确的详细地址')
      return false
    }

    if (form.streetNumber === "") {
      this.showToast('请输入正确的门牌号')
      return false
    }

    return true
  }

  showToast = (text, type = 'warning') => {
    Toast.show({
      text,
      position: 'absolute',
      type
    })
  }

  render() {

    return (
      <Container style={styles.wrapper}>
        <Content>
          <Form>
            <Item stackedLabel>
              <Label>收货人姓名</Label>
              <Input
                value={this.state.form.consignee}
                onChangeText={text => this.handleValueChange({consignee: text})}
              />
            </Item>
            <Item stackedLabel>
              <Label>手机号码</Label>
              <Input
                keyboardType="numeric"
                maxLength={12}
                value={this.state.form.phone}
                onChangeText={text => this.handleValueChange({phone: text})}
              />
            </Item>
            <Item stackedLabel onPress={this.handleModalShow}>
              <Label>城市</Label>
              <Input disabled value={this.state.form.city}/>
            </Item>
            <Item stackedLabel>
              <Label>详细地址</Label>
              <Input
                value={this.state.form.address}
                onChangeText={text => this.handleValueChange({address: text})}
              />
            </Item>
            <Item stackedLabel>
              <Label>门牌号</Label>
              <Input value={this.state.form.streetNumber} onChangeText={text => this.handleValueChange({streetNumber: text})}/>
            </Item>
            <Item onPress={this.handleIsDefaultChange}>
              <Label>是否为默认地址</Label>
              <CheckBox value={this.state.form.isDefault} disabled color={RED_COLOR} />
              <Input disabled />
            </Item>
          </Form>
          <AddressPicker
            visible={this.state.modalVisible}
            handleClose={this.handleAddressModalClose}
            handleSelect={this.handleModalSelect}
          />
        </Content>
        <TouchableNativeFeedback onPress={this.handleSubmit}>
          <Footer style={styles.footer}>
            <Text style={styles.footerContent}>确认修改</Text>
          </Footer>
        </TouchableNativeFeedback>
      </Container>
    )
  }
}
