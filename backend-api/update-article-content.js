import mysql from 'mysql2/promise';

async function updateArticleContent() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'jiujiu_admin'
  });
  
  try {
    // 更新第一篇文章的内容
    await connection.query(`
      UPDATE articles 
      SET content = '<h2>准备工作</h2>
<p>在开始之前，请确保您已准备好以下内容。这些是观看奈飞4K内容的基本要求：</p>

<h3>硬件要求</h3>
<ul>
  <li>支持4K和Netflix认证的电视盒子</li>
  <li>4K HDR电视（HDMI 2.0接口）</li>
  <li>高速HDMI 2.0线缆（18Gbps）</li>
  <li>支持5.1声道或杜比全景声的音响系统（可选）</li>
</ul>

<h3>网络要求</h3>
<ul>
  <li>稳定的宽带网络（建议100Mbps以上）</li>
  <li>支持5GHz频段的路由器</li>
  <li>奈飞支持的网络环境</li>
</ul>

<h3>账号要求</h3>
<ul>
  <li>Netflix高级会员账号（支持4K）</li>
  <li>支付方式（信用卡/PayPal）</li>
</ul>

<h2>详细步骤</h2>

<h3>步骤1：选择合适的电视盒子</h3>
<p>并非所有电视盒子都支持奈飞4K播放。以下是经过测试确实支持奈飞4K的设备：</p>
<ul>
  <li><strong>NVIDIA Shield TV Pro (2019)</strong> - 最佳性能，支持杜比视界和全景声</li>
  <li><strong>Apple TV 4K (2022)</strong> - 优秀的生态系统，流畅体验</li>
  <li><strong>小米盒子国际版</strong> - 性价比之选，支持4K但不支持杜比视界</li>
  <li><strong>Chromecast with Google TV</strong> - 小巧便携，支持4K HDR</li>
</ul>

<div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 16px; margin: 20px 0;">
  <p><strong>注意：</strong>国内版电视盒子（如天猫魔盒、当贝盒子）通常无法直接安装官方奈飞应用，即便安装也无法播放4K内容。</p>
</div>

<h3>步骤2：配置网络环境</h3>
<p>由于奈飞对地区内容的限制，我们需要配置正确的网络环境：</p>
<ol>
  <li>使用支持奈飞的网络服务（确保可以访问奈飞库）</li>
  <li>在路由器或电视盒子设置中配置网络参数</li>
  <li>测试网络速度（奈飞4K需要至少25Mbps稳定速度）</li>
</ol>

<div style="background: #e8f5e8; border: 1px solid #c3e6c3; border-radius: 8px; padding: 20px; margin: 20px 0;">
  <h4>网络优化技巧：</h4>
  <p>使用网线连接代替WiFi可以获得更稳定的速度。如果必须使用WiFi，请确保使用5GHz频段并靠近路由器。</p>
</div>

<h3>步骤3：安装奈飞应用</h3>
<p>在设备上安装官方Netflix应用：</p>
<ol>
  <li>在Google Play商店（Android TV设备）或App Store（Apple TV）搜索"Netflix"</li>
  <li>下载并安装最新版应用</li>
  <li>打开应用并登录您的Netflix账号</li>
</ol>

<h3>步骤4：配置播放设置</h3>
<p>登录后，进入账户设置调整播放参数：</p>
<ol>
  <li>进入"账户设置"→"播放设置"</li>
  <li>将数据使用设置为"高"（4K所需）</li>
  <li>打开"测试参与"选项以获取最新功能</li>
  <li>设置首选字幕样式（大小、颜色等）</li>
</ol>

<h3>步骤5：验证4K播放效果</h3>
<p>播放奈飞内容时，如何确认是否达到4K画质：</p>
<ol>
  <li>在播放界面按"信息"按钮（不同设备按键不同）</li>
  <li>查看分辨率信息（应显示2160p）</li>
  <li>检查HDR标志（DV或HDR10）</li>
  <li>注意音轨信息（DD+或Atmos）</li>
</ol>
<p>您也可以播放奈飞官方测试视频（搜索"Test Patterns"）来验证分辨率。</p>

<h2>常见问题解答</h2>

<div style="background: #ffeee6; border-radius: 12px; padding: 20px; margin: 20px 0;">
  <h3>为什么我的奈飞只显示HD，没有4K选项？</h3>
  <p>可能原因：1）您的账号不是高级会员；2）设备不支持4K播放；3）网络速度不足；4）内容在该地区没有4K版本。请逐一检查这些因素。</p>
</div>

<div style="background: #e8f5e8; border-radius: 12px; padding: 20px; margin: 20px 0;">
  <h3>如何获得中文字幕？</h3>
  <p>奈飞大部分内容都提供中文字幕。播放时点击"字幕和音轨"图标，选择"中文(简体)"即可。如果某些内容没有中文，可能是地区限制导致。</p>
</div>

<div style="background: #e8f2ff; border-radius: 12px; padding: 20px; margin: 20px 0;">
  <h3>为什么播放时经常缓冲？</h3>
  <p>缓冲通常由网络问题引起：1）网络速度不足；2）WiFi信号不稳定；3）DNS解析问题。建议使用网线连接，更换DNS服务器（如Google DNS 8.8.8.8），或升级网络带宽。</p>
</div>

<h2>总结</h2>
<p>通过本文的指导，您应该已经成功在电视盒子上配置好了奈飞4K播放环境。享受4K HDR带来的视觉盛宴和杜比全景声的沉浸式体验吧！如果在配置过程中遇到任何问题，欢迎在评论区留言，我会尽力解答。</p>

<div style="background: #e3f2fd; border: 1px solid #90caf9; border-left: 4px solid #2196f3; border-radius: 8px; padding: 20px; margin-top: 30px;">
  <p><strong>最后提示：</strong>奈飞的4K内容在不断更新，建议关注奈飞官方社交媒体或使用第三方服务（如Unogs）查询最新4K内容。同时，保持设备和应用的更新，以获得最佳体验。</p>
</div>'
      WHERE id = 1
    `);
    
    console.log('✅ 更新文章1的内容');
    
    // 更新第二篇文章的内容
    await connection.query(`
      UPDATE articles 
      SET content = '<h2>外观设计</h2>
<p>2023年的Apple TV 4K采用了全新的紧凑型设计，体积比上一代减少了50%。机身采用哑光黑色塑料材质，正面有一个小巧的状态指示灯，整体设计简约而不失精致。</p>

<h3>主要规格</h3>
<ul>
  <li>处理器：A15 Bionic芯片</li>
  <li>存储：64GB / 128GB</li>
  <li>视频输出：4K 60fps，支持杜比视界和HDR10+</li>
  <li>音频：杜比全景声、7.1环绕声</li>
  <li>连接：Wi-Fi 6、千兆以太网（128GB版本）、HDMI 2.1</li>
</ul>

<h2>性能表现</h2>
<p>得益于A15 Bionic芯片的强大性能，Apple TV 4K在各个方面都表现出色：</p>

<h3>流媒体播放</h3>
<p>支持所有主流流媒体平台，包括Netflix、Disney+、HBO Max、Apple TV+等。4K内容加载迅速，几乎没有缓冲时间。杜比视界和杜比全景声的支持让观影体验更上一层楼。</p>

<h3>游戏性能</h3>
<p>Apple Arcade游戏运行流畅，支持多个手柄连接。虽然不能与专业游戏主机相比，但对于休闲游戏来说绰绰有余。</p>

<h3>智能家居中心</h3>
<p>作为HomeKit中心，可以控制所有兼容的智能家居设备。支持Thread协议，为Matter标准做好准备。</p>

<h2>遥控器体验</h2>
<p>新款Siri Remote采用USB-C充电接口，一次充电可使用数月。触控板操作精准，支持手势控制。内置的"查找"功能可以通过iPhone定位遥控器。</p>

<h2>生态系统整合</h2>
<ul>
  <li><strong>AirPlay：</strong>轻松从iPhone、iPad投屏</li>
  <li><strong>照片同步：</strong>iCloud照片自动同步显示</li>
  <li><strong>Apple Music：</strong>完美整合，支持空间音频</li>
  <li><strong>健身+：</strong>在大屏幕上享受健身课程</li>
</ul>

<h2>优缺点总结</h2>

<div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
  <h3>✅ 优点</h3>
  <ul>
    <li>出色的4K HDR画质</li>
    <li>流畅的系统体验</li>
    <li>完善的生态系统</li>
    <li>体积小巧，设计精美</li>
    <li>支持最新的视频和音频标准</li>
  </ul>
</div>

<div style="background: #ffeee6; padding: 20px; border-radius: 8px; margin: 20px 0;">
  <h3>❌ 缺点</h3>
  <ul>
    <li>价格较高</li>
    <li>64GB版本没有以太网接口</li>
    <li>游戏库相对有限</li>
    <li>部分功能需要其他Apple设备配合</li>
  </ul>
</div>

<h2>购买建议</h2>
<p>如果您已经深度使用Apple生态系统，Apple TV 4K是不二之选。对于预算有限或主要使用Android设备的用户，可以考虑其他更具性价比的选择。建议选择128GB版本，额外的存储空间和千兆以太网接口值得多花的钱。</p>

<h2>总结</h2>
<p>Apple TV 4K (2023)是目前市场上最好的流媒体设备之一，特别是对于Apple用户来说。虽然价格不菲，但出色的性能、丰富的功能和优秀的用户体验让它物有所值。</p>'
      WHERE id = 2
    `);
    
    console.log('✅ 更新文章2的内容');
    
    // 更新第三篇文章的内容
    await connection.query(`
      UPDATE articles 
      SET content = '<h2>规划您的家庭影院</h2>
<p>打造完美的家庭影院需要仔细规划。本指南将帮助您从零开始，一步步建立属于自己的私人影院。</p>

<h2>空间选择与处理</h2>

<h3>理想的房间条件</h3>
<ul>
  <li>面积：至少15平方米，理想为20-30平方米</li>
  <li>形状：长方形优于正方形</li>
  <li>天花板高度：2.4米以上</li>
  <li>窗户：越少越好，便于遮光</li>
</ul>

<h3>声学处理</h3>
<p>良好的声学环境是优质体验的关键：</p>
<ol>
  <li>使用吸音板处理第一反射点</li>
  <li>在后墙添加扩散板</li>
  <li>铺设地毯减少地面反射</li>
  <li>使用厚重窗帘改善声学并遮光</li>
</ol>

<h2>显示设备选择</h2>

<h3>投影仪 vs 电视</h3>
<table style="width: 100%; border-collapse: collapse;">
  <tr>
    <th style="border: 1px solid #ddd; padding: 8px;">特性</th>
    <th style="border: 1px solid #ddd; padding: 8px;">投影仪</th>
    <th style="border: 1px solid #ddd; padding: 8px;">大屏电视</th>
  </tr>
  <tr>
    <td style="border: 1px solid #ddd; padding: 8px;">画面尺寸</td>
    <td style="border: 1px solid #ddd; padding: 8px;">100-150英寸</td>
    <td style="border: 1px solid #ddd; padding: 8px;">65-85英寸</td>
  </tr>
  <tr>
    <td style="border: 1px solid #ddd; padding: 8px;">画质</td>
    <td style="border: 1px solid #ddd; padding: 8px;">优秀（需要遮光）</td>
    <td style="border: 1px solid #ddd; padding: 8px;">卓越（不受环境光影响）</td>
  </tr>
  <tr>
    <td style="border: 1px solid #ddd; padding: 8px;">价格</td>
    <td style="border: 1px solid #ddd; padding: 8px;">中等</td>
    <td style="border: 1px solid #ddd; padding: 8px;">较高</td>
  </tr>
  <tr>
    <td style="border: 1px solid #ddd; padding: 8px;">安装难度</td>
    <td style="border: 1px solid #ddd; padding: 8px;">较复杂</td>
    <td style="border: 1px solid #ddd; padding: 8px;">简单</td>
  </tr>
</table>

<h3>推荐配置</h3>
<ul>
  <li><strong>入门级（预算1-2万）：</strong>65寸4K电视 + 5.1声道音响</li>
  <li><strong>中端（预算3-5万）：</strong>75寸OLED电视 + 7.1声道音响</li>
  <li><strong>高端（预算10万+）：</strong>4K激光投影 + 7.2.4全景声系统</li>
</ul>

<h2>音响系统配置</h2>

<h3>5.1声道基础配置</h3>
<ol>
  <li>前置左右主音箱：负责主要声音输出</li>
  <li>中置音箱：对话和人声</li>
  <li>环绕音箱：环境音效</li>
  <li>低音炮：低频效果</li>
</ol>

<h3>音箱摆位要点</h3>
<ul>
  <li>主音箱与听众位置形成等边三角形</li>
  <li>中置音箱放置在屏幕下方或上方中央</li>
  <li>环绕音箱位于听众位置两侧稍后方</li>
  <li>低音炮可灵活摆放，避免墙角</li>
</ul>

<h2>设备连接与设置</h2>

<h3>推荐的信号链路</h3>
<p>播放设备 → AV功放 → 显示设备</p>
<p>这样可以确保音频和视频都得到最佳处理。</p>

<h3>线材选择</h3>
<ul>
  <li>HDMI线：选择HDMI 2.1认证线材，支持4K 120Hz</li>
  <li>音箱线：根据距离选择合适线径，一般14-16 AWG</li>
  <li>电源线：使用独立电路，避免干扰</li>
</ul>

<h2>智能化升级</h2>

<h3>推荐的智能设备</h3>
<ul>
  <li>智能灯光：Philips Hue或Yeelight</li>
  <li>电动窗帘：自动遮光</li>
  <li>智能插座：一键开关所有设备</li>
  <li>万能遥控：罗技Harmony或小米万能遥控</li>
</ul>

<h2>预算分配建议</h2>
<div style="background: #f0f8ff; padding: 20px; border-radius: 8px;">
  <ul>
    <li>显示设备：40-50%</li>
    <li>音响系统：30-40%</li>
    <li>播放设备：10-15%</li>
    <li>线材配件：5-10%</li>
    <li>声学处理：5-10%</li>
  </ul>
</div>

<h2>常见误区</h2>
<ol>
  <li><strong>误区：</strong>越大的音箱效果越好<br><strong>真相：</strong>音箱要与房间大小匹配</li>
  <li><strong>误区：</strong>线材越贵越好<br><strong>真相：</strong>合格的线材即可，过度投资意义不大</li>
  <li><strong>误区：</strong>功率越大越好<br><strong>真相：</strong>一般家用30-50W每声道足够</li>
</ol>

<h2>总结</h2>
<p>打造家庭影院是一个系统工程，需要根据自己的预算、空间和需求做出平衡的选择。记住，最好的系统是适合自己的系统。从基础配置开始，逐步升级，享受这个过程带来的乐趣。</p>'
      WHERE id = 3
    `);
    
    console.log('✅ 更新文章3的内容');
    
    // 更新第四篇文章的内容
    await connection.query(`
      UPDATE articles 
      SET content = '<h2>主流流媒体平台概览</h2>
<p>在这个流媒体时代，选择合适的平台变得越来越重要。本文将详细对比Netflix、Disney+、HBO Max、Apple TV+和Amazon Prime Video这五大平台。</p>

<h2>内容库对比</h2>

<h3>Netflix（奈飞）</h3>
<ul>
  <li><strong>内容数量：</strong>15000+ 部影视作品</li>
  <li><strong>原创内容：</strong>《怪奇物语》《王冠》《鱿鱼游戏》等</li>
  <li><strong>内容类型：</strong>覆盖全球各类内容，原创剧集强大</li>
  <li><strong>更新频率：</strong>每周都有新内容上线</li>
</ul>

<h3>Disney+（迪士尼+）</h3>
<ul>
  <li><strong>内容数量：</strong>8000+ 部影视作品</li>
  <li><strong>独家内容：</strong>漫威、星战、皮克斯、国家地理</li>
  <li><strong>内容类型：</strong>家庭向内容为主，超级英雄电影</li>
  <li><strong>更新频率：</strong>每周更新剧集</li>
</ul>

<h3>HBO Max</h3>
<ul>
  <li><strong>内容数量：</strong>10000+ 部影视作品</li>
  <li><strong>王牌内容：</strong>《权力的游戏》《西部世界》《继承之战》</li>
  <li><strong>内容类型：</strong>高质量美剧，华纳兄弟电影</li>
  <li><strong>更新频率：</strong>重质不重量</li>
</ul>

<h3>Apple TV+</h3>
<ul>
  <li><strong>内容数量：</strong>200+ 部原创作品</li>
  <li><strong>原创精品：</strong>《晨间风云》《足球教练》《基地》</li>
  <li><strong>内容类型：</strong>全部为高质量原创内容</li>
  <li><strong>更新频率：</strong>每月几部新作</li>
</ul>

<h3>Amazon Prime Video</h3>
<ul>
  <li><strong>内容数量：</strong>12000+ 部影视作品</li>
  <li><strong>热门内容：</strong>《黑袍纠察队》《了不起的麦瑟尔夫人》</li>
  <li><strong>内容类型：</strong>混合原创和授权内容</li>
  <li><strong>更新频率：</strong>稳定更新</li>
</ul>

<h2>价格对比（月费）</h2>

<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
  <tr>
    <th style="border: 1px solid #ddd; padding: 10px; background: #f5f5f5;">平台</th>
    <th style="border: 1px solid #ddd; padding: 10px; background: #f5f5f5;">基础套餐</th>
    <th style="border: 1px solid #ddd; padding: 10px; background: #f5f5f5;">标准套餐</th>
    <th style="border: 1px solid #ddd; padding: 10px; background: #f5f5f5;">高级套餐</th>
  </tr>
  <tr>
    <td style="border: 1px solid #ddd; padding: 10px;">Netflix</td>
    <td style="border: 1px solid #ddd; padding: 10px;">$6.99（含广告）</td>
    <td style="border: 1px solid #ddd; padding: 10px;">$15.49</td>
    <td style="border: 1px solid #ddd; padding: 10px;">$22.99（4K）</td>
  </tr>
  <tr>
    <td style="border: 1px solid #ddd; padding: 10px;">Disney+</td>
    <td style="border: 1px solid #ddd; padding: 10px;">$7.99（含广告）</td>
    <td style="border: 1px solid #ddd; padding: 10px;">$13.99</td>
    <td style="border: 1px solid #ddd; padding: 10px;">-</td>
  </tr>
  <tr>
    <td style="border: 1px solid #ddd; padding: 10px;">HBO Max</td>
    <td style="border: 1px solid #ddd; padding: 10px;">$9.99（含广告）</td>
    <td style="border: 1px solid #ddd; padding: 10px;">$15.99</td>
    <td style="border: 1px solid #ddd; padding: 10px;">$19.99（4K）</td>
  </tr>
  <tr>
    <td style="border: 1px solid #ddd; padding: 10px;">Apple TV+</td>
    <td style="border: 1px solid #ddd; padding: 10px;">$6.99</td>
    <td style="border: 1px solid #ddd; padding: 10px;">-</td>
    <td style="border: 1px solid #ddd; padding: 10px;">-</td>
  </tr>
  <tr>
    <td style="border: 1px solid #ddd; padding: 10px;">Prime Video</td>
    <td style="border: 1px solid #ddd; padding: 10px;">$8.99</td>
    <td style="border: 1px solid #ddd; padding: 10px;">$14.99（含Prime会员）</td>
    <td style="border: 1px solid #ddd; padding: 10px;">-</td>
  </tr>
</table>

<h2>功能特性对比</h2>

<h3>视频质量</h3>
<ul>
  <li><strong>Netflix：</strong>最高4K HDR，部分内容支持杜比视界</li>
  <li><strong>Disney+：</strong>4K HDR，IMAX Enhanced</li>
  <li><strong>HBO Max：</strong>4K HDR（限高级套餐）</li>
  <li><strong>Apple TV+：</strong>全部内容4K HDR，杜比视界</li>
  <li><strong>Prime Video：</strong>4K HDR，部分内容额外收费</li>
</ul>

<h3>同时观看设备数</h3>
<ul>
  <li><strong>Netflix：</strong>1-4个（取决于套餐）</li>
  <li><strong>Disney+：</strong>4个</li>
  <li><strong>HBO Max：</strong>3个</li>
  <li><strong>Apple TV+：</strong>6个</li>
  <li><strong>Prime Video：</strong>3个</li>
</ul>

<h3>离线下载</h3>
<p>所有平台都支持移动设备离线下载，但下载数量和保存时间有所限制。</p>

<h2>地区可用性</h2>

<div style="background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 8px; margin: 20px 0;">
  <p><strong>⚠️ 注意：</strong>部分平台在某些地区不可用或内容受限。使用前请确认您所在地区的服务可用性。</p>
</div>

<h2>用户体验对比</h2>

<h3>界面设计</h3>
<ul>
  <li><strong>Netflix：</strong>⭐⭐⭐⭐⭐ 简洁直观，个性化推荐出色</li>
  <li><strong>Disney+：</strong>⭐⭐⭐⭐ 清晰的品牌分类</li>
  <li><strong>HBO Max：</strong>⭐⭐⭐ 略显复杂</li>
  <li><strong>Apple TV+：</strong>⭐⭐⭐⭐⭐ 精美简约</li>
  <li><strong>Prime Video：</strong>⭐⭐⭐ 需要改进</li>
</ul>

<h3>设备支持</h3>
<p>所有平台都支持主流设备，包括：</p>
<ul>
  <li>智能电视（Samsung、LG、Sony等）</li>
  <li>流媒体设备（Apple TV、Roku、Chromecast）</li>
  <li>游戏主机（PlayStation、Xbox）</li>
  <li>移动设备（iOS、Android）</li>
  <li>网页浏览器</li>
</ul>

<h2>选择建议</h2>

<div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
  <h3>✅ 选择Netflix如果您：</h3>
  <ul>
    <li>想要最丰富的内容库</li>
    <li>喜欢追剧和看原创内容</li>
    <li>需要多语言字幕支持</li>
  </ul>
</div>

<div style="background: #f3e5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
  <h3>✅ 选择Disney+如果您：</h3>
  <ul>
    <li>有孩子的家庭</li>
    <li>漫威/星战粉丝</li>
    <li>喜欢经典动画</li>
  </ul>
</div>

<div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
  <h3>✅ 选择HBO Max如果您：</h3>
  <ul>
    <li>追求高质量美剧</li>
    <li>喜欢HBO经典作品</li>
    <li>想第一时间看华纳新片</li>
  </ul>
</div>

<h2>组合订阅策略</h2>
<p>很多用户选择订阅多个平台，以下是一些推荐组合：</p>
<ul>
  <li><strong>家庭套餐：</strong>Netflix + Disney+（全面覆盖）</li>
  <li><strong>影迷套餐：</strong>Netflix + HBO Max（质量优先）</li>
  <li><strong>经济套餐：</strong>Apple TV+（单独）或 Prime Video（含其他权益）</li>
</ul>

<h2>总结</h2>
<p>没有一个平台能满足所有需求。Netflix仍是内容最全面的选择，Disney+垄断了家庭娱乐市场，HBO Max提供最优质的成人向内容，Apple TV+虽小而精，Prime Video则提供了不错的性价比。根据您的观看习惯和预算，选择最适合的平台或组合。记住，大部分平台都提供免费试用期，不妨先体验再决定。</p>'
      WHERE id = 4
    `);
    
    console.log('✅ 更新文章4的内容');
    
    // 验证更新
    const [articles] = await connection.query('SELECT id, title, SUBSTRING(content, 1, 100) as content_preview FROM articles');
    console.log('\n更新后的文章内容预览：');
    articles.forEach(article => {
      console.log(`\n[${article.id}] ${article.title}`);
      console.log(`内容预览: ${article.content_preview}...`);
    });
    
    console.log('\n✅ 所有文章内容更新完成！');
    
  } catch (error) {
    console.error('❌ 更新失败:', error);
  } finally {
    await connection.end();
  }
}

updateArticleContent();