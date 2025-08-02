import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  Card,
  Space,
  Toast,
  NavBar,
  Tabs
} from 'antd-mobile';
import { EyeInvisibleOutline, EyeOutline, UserOutline, MailOutline, LockOutline } from 'antd-mobile-icons';
import { useAuthStore } from '../store/useAuthStore';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, register, isLoading } = useAuthStore();
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();

  const handleLogin = async (values: any) => {
    try {
      await login(values.email, values.password);
      Toast.show({
        content: '登录成功！',
        position: 'center'
      });
      navigate('/');
    } catch (error: any) {
      Toast.show({
        content: error.message || '登录失败',
        position: 'center'
      });
    }
  };

  const handleRegister = async (values: any) => {
    if (values.password !== values.confirmPassword) {
      Toast.show({
        content: '两次输入的密码不一致',
        position: 'center'
      });
      return;
    }
    
    try {
      await register(values.email, values.password, values.name, values.confirmPassword);
      Toast.show({
        content: '注册成功！',
        position: 'center'
      });
      navigate('/');
    } catch (error: any) {
      Toast.show({
        content: error.message || '注册失败',
        position: 'center'
      });
    }
  };

  const tabItems = [
    {
      key: 'login',
      title: '登录',
    },
    {
      key: 'register',
      title: '注册',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <NavBar onBack={() => navigate('/')} className="bg-white">
        用户中心
      </NavBar>
      
      <div className="px-4 py-6">
        <Card className="rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-6 text-center">
            <h1 className="text-2xl font-bold mb-2">文生视界</h1>
            <p className="text-purple-100">AI驱动的创意内容生成平台</p>
          </div>

          {/* Tabs */}
          <div className="p-4">
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              className="mb-4"
            >
              {tabItems.map(item => (
                <Tabs.Tab title={item.title} key={item.key} />
              ))}
            </Tabs>

            {/* Login Form */}
            {activeTab === 'login' && (
              <Form
                form={loginForm}
                onFinish={handleLogin}
                layout="vertical"
                className="space-y-4"
              >
                <Form.Item
                  name="email"
                  label="邮箱地址"
                  rules={[
                    { required: true, message: '请输入邮箱地址' },
                    { type: 'email', message: '请输入有效的邮箱地址' }
                  ]}
                >
                  <Input
                    placeholder="请输入邮箱地址"
                    prefix={<MailOutline />}
                    clearable
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label="密码"
                  rules={[{ required: true, message: '请输入密码' }]}
                >
                  <Input
                    placeholder="请输入密码"
                    type={showPassword ? 'text' : 'password'}
                    prefix={<LockOutline />}
                    suffix={
                      <div onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOutline /> : <EyeInvisibleOutline />}
                      </div>
                    }
                  />
                </Form.Item>

                <Button
                  type="submit"
                  color="primary"
                  size="large"
                  block
                  loading={isLoading}
                  className="mt-6 bg-gradient-to-r from-purple-500 to-blue-500"
                >
                  登录
                </Button>
              </Form>
            )}

            {/* Register Form */}
            {activeTab === 'register' && (
              <Form
                form={registerForm}
                onFinish={handleRegister}
                layout="vertical"
                className="space-y-4"
              >
                <Form.Item
                  name="name"
                  label="姓名"
                  rules={[{ required: true, message: '请输入您的姓名' }]}
                >
                  <Input
                    placeholder="请输入您的姓名"
                    prefix={<UserOutline />}
                    clearable
                  />
                </Form.Item>

                <Form.Item
                  name="email"
                  label="邮箱地址"
                  rules={[
                    { required: true, message: '请输入邮箱地址' },
                    { type: 'email', message: '请输入有效的邮箱地址' }
                  ]}
                >
                  <Input
                    placeholder="请输入邮箱地址"
                    prefix={<MailOutline />}
                    clearable
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label="密码"
                  rules={[
                    { required: true, message: '请输入密码' },
                    { min: 6, message: '密码至少6位' }
                  ]}
                >
                  <Input
                    placeholder="请输入密码"
                    type={showPassword ? 'text' : 'password'}
                    prefix={<LockOutline />}
                    suffix={
                      <div onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOutline /> : <EyeInvisibleOutline />}
                      </div>
                    }
                  />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  label="确认密码"
                  rules={[{ required: true, message: '请再次输入密码' }]}
                >
                  <Input
                    placeholder="请再次输入密码"
                    type={showConfirmPassword ? 'text' : 'password'}
                    prefix={<LockOutline />}
                    suffix={
                      <div onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <EyeOutline /> : <EyeInvisibleOutline />}
                      </div>
                    }
                  />
                </Form.Item>

                <Button
                  type="submit"
                  color="primary"
                  size="large"
                  block
                  loading={isLoading}
                  className="mt-6 bg-gradient-to-r from-purple-500 to-blue-500"
                >
                  注册
                </Button>
              </Form>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;