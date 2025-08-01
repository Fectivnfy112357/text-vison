// 测试认证功能的工具函数

// 模拟不同格式的后端响应数据
export const mockAuthResponses = {
  // 格式1: 响应中包含 user 字段
  withUserField: {
    code: 200,
    message: '成功',
    data: {
      token: 'mock-token-123',
      user: {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        avatar: null
      }
    }
  },
  
  // 格式2: 响应直接包含用户数据
  directUserData: {
    code: 200,
    message: '成功',
    data: {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      avatar: null,
      token: 'mock-token-123'
    }
  },
  
  // 格式3: 无效的响应格式
  invalidFormat: {
    code: 200,
    message: '成功',
    data: {
      token: 'mock-token-123'
      // 缺少用户数据
    }
  }
};

// 测试数据格式处理逻辑
export const testDataFormatHandling = (response: any) => {
  let userData;
  
  if (response && response.user) {
    // 如果响应中有 user 字段
    userData = response.user;
    console.log('✅ 检测到 user 字段格式');
  } else if (response && response.id) {
    // 如果响应直接包含用户数据
    userData = response;
    console.log('✅ 检测到直接用户数据格式');
  } else {
    console.error('❌ 无效的响应格式:', response);
    return null;
  }
  
  if (!userData || !userData.id) {
    console.error('❌ 用户数据无效:', userData);
    return null;
  }
  
  console.log('✅ 数据格式验证通过:', userData);
  return userData;
};

// 运行测试
export const runAuthTests = () => {
  console.log('🧪 开始测试认证数据格式处理...');
  
  console.log('\n测试格式1 (包含user字段):');
  testDataFormatHandling(mockAuthResponses.withUserField.data);
  
  console.log('\n测试格式2 (直接用户数据):');
  testDataFormatHandling(mockAuthResponses.directUserData.data);
  
  console.log('\n测试格式3 (无效格式):');
  testDataFormatHandling(mockAuthResponses.invalidFormat.data);
  
  console.log('\n🎉 测试完成!');
};