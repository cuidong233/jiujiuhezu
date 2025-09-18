-- MySQL dump 10.13  Distrib 9.4.0, for macos15.4 (arm64)
--
-- Host: localhost    Database: jiujiu_admin
-- ------------------------------------------------------
-- Server version	9.4.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `articles`
--

DROP TABLE IF EXISTS `articles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `articles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL COMMENT '文章标题',
  `subtitle` varchar(255) DEFAULT NULL COMMENT '副标题',
  `description` text COMMENT '文章描述/摘要',
  `content` longtext NOT NULL COMMENT '文章内容（HTML格式）',
  `category` varchar(50) NOT NULL DEFAULT '教程指南' COMMENT '文章分类',
  `image` varchar(500) DEFAULT NULL COMMENT '文章封面图',
  `author_name` varchar(50) NOT NULL DEFAULT '管理员' COMMENT '作者名称',
  `author_avatar` varchar(500) DEFAULT NULL COMMENT '作者头像',
  `read_time` varchar(20) DEFAULT '5分钟' COMMENT '阅读时间',
  `views` int DEFAULT '0' COMMENT '浏览次数',
  `likes` int DEFAULT '0' COMMENT '点赞数',
  `status` enum('draft','published','archived') DEFAULT 'draft' COMMENT '文章状态',
  `publish_date` datetime DEFAULT NULL COMMENT '发布日期',
  `tags` text COMMENT '标签（逗号分隔）',
  `meta_title` varchar(255) DEFAULT NULL COMMENT 'SEO标题',
  `meta_description` text COMMENT 'SEO描述',
  `meta_keywords` text COMMENT 'SEO关键词',
  `sort_order` int DEFAULT '0' COMMENT '排序顺序',
  `is_featured` tinyint(1) DEFAULT '0' COMMENT '是否推荐',
  `related_articles` text COMMENT '相关文章ID（逗号分隔）',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_status` (`status`),
  KEY `idx_publish_date` (`publish_date`),
  KEY `idx_sort_order` (`sort_order`),
  KEY `idx_featured` (`is_featured`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='文章表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `articles`
--

LOCK TABLES `articles` WRITE;
/*!40000 ALTER TABLE `articles` DISABLE KEYS */;
INSERT INTO `articles` VALUES (1,'电视盒子看奈飞4K完整教程','解锁高清流媒体体验','教你如何选择合适的电视盒子，安装奈飞App解码4K画质，解决播放卡顿问题','<h2>准备工作</h2>\n<p>在开始之前，请确保您已准备好以下内容。这些是观看奈飞4K内容的基本要求：</p>\n\n<h3>硬件要求</h3>\n<ul>\n  <li>支持4K和Netflix认证的电视盒子</li>\n  <li>4K HDR电视（HDMI 2.0接口）</li>\n  <li>高速HDMI 2.0线缆（18Gbps）</li>\n  <li>支持5.1声道或杜比全景声的音响系统（可选）</li>\n</ul>\n\n<h3>网络要求</h3>\n<ul>\n  <li>稳定的宽带网络（建议100Mbps以上）</li>\n  <li>支持5GHz频段的路由器</li>\n  <li>奈飞支持的网络环境</li>\n</ul>\n\n<h3>账号要求</h3>\n<ul>\n  <li>Netflix高级会员账号（支持4K）</li>\n  <li>支付方式（信用卡/PayPal）</li>\n</ul>\n\n<h2>详细步骤</h2>\n\n<h3>步骤1：选择合适的电视盒子</h3>\n<p>并非所有电视盒子都支持奈飞4K播放。以下是经过测试确实支持奈飞4K的设备：</p>\n<ul>\n  <li><strong>NVIDIA Shield TV Pro (2019)</strong> - 最佳性能，支持杜比视界和全景声</li>\n  <li><strong>Apple TV 4K (2022)</strong> - 优秀的生态系统，流畅体验</li>\n  <li><strong>小米盒子国际版</strong> - 性价比之选，支持4K但不支持杜比视界</li>\n  <li><strong>Chromecast with Google TV</strong> - 小巧便携，支持4K HDR</li>\n</ul>\n\n<div style=\"background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 16px; margin: 20px 0;\">\n  <p><strong>注意：</strong>国内版电视盒子（如天猫魔盒、当贝盒子）通常无法直接安装官方奈飞应用，即便安装也无法播放4K内容。</p>\n</div>\n\n<h3>步骤2：配置网络环境</h3>\n<p>由于奈飞对地区内容的限制，我们需要配置正确的网络环境：</p>\n<ol>\n  <li>使用支持奈飞的网络服务（确保可以访问奈飞库）</li>\n  <li>在路由器或电视盒子设置中配置网络参数</li>\n  <li>测试网络速度（奈飞4K需要至少25Mbps稳定速度）</li>\n</ol>\n\n<div style=\"background: #e8f5e8; border: 1px solid #c3e6c3; border-radius: 8px; padding: 20px; margin: 20px 0;\">\n  <h4>网络优化技巧：</h4>\n  <p>使用网线连接代替WiFi可以获得更稳定的速度。如果必须使用WiFi，请确保使用5GHz频段并靠近路由器。</p>\n</div>\n\n<h3>步骤3：安装奈飞应用</h3>\n<p>在设备上安装官方Netflix应用：</p>\n<ol>\n  <li>在Google Play商店（Android TV设备）或App Store（Apple TV）搜索\"Netflix\"</li>\n  <li>下载并安装最新版应用</li>\n  <li>打开应用并登录您的Netflix账号</li>\n</ol>\n\n<h3>步骤4：配置播放设置</h3>\n<p>登录后，进入账户设置调整播放参数：</p>\n<ol>\n  <li>进入\"账户设置\"→\"播放设置\"</li>\n  <li>将数据使用设置为\"高\"（4K所需）</li>\n  <li>打开\"测试参与\"选项以获取最新功能</li>\n  <li>设置首选字幕样式（大小、颜色等）</li>\n</ol>\n\n<h3>步骤5：验证4K播放效果</h3>\n<p>播放奈飞内容时，如何确认是否达到4K画质：</p>\n<ol>\n  <li>在播放界面按\"信息\"按钮（不同设备按键不同）</li>\n  <li>查看分辨率信息（应显示2160p）</li>\n  <li>检查HDR标志（DV或HDR10）</li>\n  <li>注意音轨信息（DD+或Atmos）</li>\n</ol>\n<p>您也可以播放奈飞官方测试视频（搜索\"Test Patterns\"）来验证分辨率。</p>\n\n<h2>常见问题解答</h2>\n\n<div style=\"background: #ffeee6; border-radius: 12px; padding: 20px; margin: 20px 0;\">\n  <h3>为什么我的奈飞只显示HD，没有4K选项？</h3>\n  <p>可能原因：1）您的账号不是高级会员；2）设备不支持4K播放；3）网络速度不足；4）内容在该地区没有4K版本。请逐一检查这些因素。</p>\n</div>\n\n<div style=\"background: #e8f5e8; border-radius: 12px; padding: 20px; margin: 20px 0;\">\n  <h3>如何获得中文字幕？</h3>\n  <p>奈飞大部分内容都提供中文字幕。播放时点击\"字幕和音轨\"图标，选择\"中文(简体)\"即可。如果某些内容没有中文，可能是地区限制导致。</p>\n</div>\n\n<div style=\"background: #e8f2ff; border-radius: 12px; padding: 20px; margin: 20px 0;\">\n  <h3>为什么播放时经常缓冲？</h3>\n  <p>缓冲通常由网络问题引起：1）网络速度不足；2）WiFi信号不稳定；3）DNS解析问题。建议使用网线连接，更换DNS服务器（如Google DNS 8.8.8.8），或升级网络带宽。</p>\n</div>\n\n<h2>总结</h2>\n<p>通过本文的指导，您应该已经成功在电视盒子上配置好了奈飞4K播放环境。享受4K HDR带来的视觉盛宴和杜比全景声的沉浸式体验吧！如果在配置过程中遇到任何问题，欢迎在评论区留言，我会尽力解答。</p>\n\n<div style=\"background: #e3f2fd; border: 1px solid #90caf9; border-left: 4px solid #2196f3; border-radius: 8px; padding: 20px; margin-top: 30px;\">\n  <p><strong>最后提示：</strong>奈飞的4K内容在不断更新，建议关注奈飞官方社交媒体或使用第三方服务（如Unogs）查询最新4K内容。同时，保持设备和应用的更新，以获得最佳体验。</p>\n</div>','教程指南','/images/help1.png','张科技','/images/zhangkeji.png','8分钟',3,0,'published','2025-09-08 19:43:45','流媒体,4K,电视盒子,Netflix',NULL,NULL,NULL,0,1,NULL,'2025-09-08 19:43:45','2025-09-11 18:19:05'),(2,'2023年Apple TV 4K全面评测','值得购买吗？','深度评测最新款Apple TV 4K，包括性能、功能、生态系统等方面','<h2>外观设计</h2>\n<p>2023年的Apple TV 4K采用了全新的紧凑型设计，体积比上一代减少了50%。机身采用哑光黑色塑料材质，正面有一个小巧的状态指示灯，整体设计简约而不失精致。</p>\n\n<h3>主要规格</h3>\n<ul>\n  <li>处理器：A15 Bionic芯片</li>\n  <li>存储：64GB / 128GB</li>\n  <li>视频输出：4K 60fps，支持杜比视界和HDR10+</li>\n  <li>音频：杜比全景声、7.1环绕声</li>\n  <li>连接：Wi-Fi 6、千兆以太网（128GB版本）、HDMI 2.1</li>\n</ul>\n\n<h2>性能表现</h2>\n<p>得益于A15 Bionic芯片的强大性能，Apple TV 4K在各个方面都表现出色：</p>\n\n<h3>流媒体播放</h3>\n<p>支持所有主流流媒体平台，包括Netflix、Disney+、HBO Max、Apple TV+等。4K内容加载迅速，几乎没有缓冲时间。杜比视界和杜比全景声的支持让观影体验更上一层楼。</p>\n\n<h3>游戏性能</h3>\n<p>Apple Arcade游戏运行流畅，支持多个手柄连接。虽然不能与专业游戏主机相比，但对于休闲游戏来说绰绰有余。</p>\n\n<h3>智能家居中心</h3>\n<p>作为HomeKit中心，可以控制所有兼容的智能家居设备。支持Thread协议，为Matter标准做好准备。</p>\n\n<h2>遥控器体验</h2>\n<p>新款Siri Remote采用USB-C充电接口，一次充电可使用数月。触控板操作精准，支持手势控制。内置的\"查找\"功能可以通过iPhone定位遥控器。</p>\n\n<h2>生态系统整合</h2>\n<ul>\n  <li><strong>AirPlay：</strong>轻松从iPhone、iPad投屏</li>\n  <li><strong>照片同步：</strong>iCloud照片自动同步显示</li>\n  <li><strong>Apple Music：</strong>完美整合，支持空间音频</li>\n  <li><strong>健身+：</strong>在大屏幕上享受健身课程</li>\n</ul>\n\n<h2>优缺点总结</h2>\n\n<div style=\"background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;\">\n  <h3>✅ 优点</h3>\n  <ul>\n    <li>出色的4K HDR画质</li>\n    <li>流畅的系统体验</li>\n    <li>完善的生态系统</li>\n    <li>体积小巧，设计精美</li>\n    <li>支持最新的视频和音频标准</li>\n  </ul>\n</div>\n\n<div style=\"background: #ffeee6; padding: 20px; border-radius: 8px; margin: 20px 0;\">\n  <h3>❌ 缺点</h3>\n  <ul>\n    <li>价格较高</li>\n    <li>64GB版本没有以太网接口</li>\n    <li>游戏库相对有限</li>\n    <li>部分功能需要其他Apple设备配合</li>\n  </ul>\n</div>\n\n<h2>购买建议</h2>\n<p>如果您已经深度使用Apple生态系统，Apple TV 4K是不二之选。对于预算有限或主要使用Android设备的用户，可以考虑其他更具性价比的选择。建议选择128GB版本，额外的存储空间和千兆以太网接口值得多花的钱。</p>\n\n<h2>总结</h2>\n<p>Apple TV 4K (2023)是目前市场上最好的流媒体设备之一，特别是对于Apple用户来说。虽然价格不菲，但出色的性能、丰富的功能和优秀的用户体验让它物有所值。</p>','设备评测','/images/related-1.jpg','李评测','/images/head1.png','10分钟',3,0,'published','2025-09-08 19:43:45','Apple TV,4K,评测,流媒体设备',NULL,NULL,NULL,0,1,NULL,'2025-09-08 19:43:45','2025-09-10 01:15:25'),(3,'打造完美家庭影院','从入门到专业的完整指南','详细介绍如何搭建家庭影院系统，包括设备选择、布线、调试等','<h2>规划您的家庭影院</h2>\n<p>打造完美的家庭影院需要仔细规划。本指南将帮助您从零开始，一步步建立属于自己的私人影院。</p>\n\n<h2>空间选择与处理</h2>\n\n<h3>理想的房间条件</h3>\n<ul>\n  <li>面积：至少15平方米，理想为20-30平方米</li>\n  <li>形状：长方形优于正方形</li>\n  <li>天花板高度：2.4米以上</li>\n  <li>窗户：越少越好，便于遮光</li>\n</ul>\n\n<h3>声学处理</h3>\n<p>良好的声学环境是优质体验的关键：</p>\n<ol>\n  <li>使用吸音板处理第一反射点</li>\n  <li>在后墙添加扩散板</li>\n  <li>铺设地毯减少地面反射</li>\n  <li>使用厚重窗帘改善声学并遮光</li>\n</ol>\n\n<h2>显示设备选择</h2>\n\n<h3>投影仪 vs 电视</h3>\n<table style=\"width: 100%; border-collapse: collapse;\">\n  <tr>\n    <th style=\"border: 1px solid #ddd; padding: 8px;\">特性</th>\n    <th style=\"border: 1px solid #ddd; padding: 8px;\">投影仪</th>\n    <th style=\"border: 1px solid #ddd; padding: 8px;\">大屏电视</th>\n  </tr>\n  <tr>\n    <td style=\"border: 1px solid #ddd; padding: 8px;\">画面尺寸</td>\n    <td style=\"border: 1px solid #ddd; padding: 8px;\">100-150英寸</td>\n    <td style=\"border: 1px solid #ddd; padding: 8px;\">65-85英寸</td>\n  </tr>\n  <tr>\n    <td style=\"border: 1px solid #ddd; padding: 8px;\">画质</td>\n    <td style=\"border: 1px solid #ddd; padding: 8px;\">优秀（需要遮光）</td>\n    <td style=\"border: 1px solid #ddd; padding: 8px;\">卓越（不受环境光影响）</td>\n  </tr>\n  <tr>\n    <td style=\"border: 1px solid #ddd; padding: 8px;\">价格</td>\n    <td style=\"border: 1px solid #ddd; padding: 8px;\">中等</td>\n    <td style=\"border: 1px solid #ddd; padding: 8px;\">较高</td>\n  </tr>\n  <tr>\n    <td style=\"border: 1px solid #ddd; padding: 8px;\">安装难度</td>\n    <td style=\"border: 1px solid #ddd; padding: 8px;\">较复杂</td>\n    <td style=\"border: 1px solid #ddd; padding: 8px;\">简单</td>\n  </tr>\n</table>\n\n<h3>推荐配置</h3>\n<ul>\n  <li><strong>入门级（预算1-2万）：</strong>65寸4K电视 + 5.1声道音响</li>\n  <li><strong>中端（预算3-5万）：</strong>75寸OLED电视 + 7.1声道音响</li>\n  <li><strong>高端（预算10万+）：</strong>4K激光投影 + 7.2.4全景声系统</li>\n</ul>\n\n<h2>音响系统配置</h2>\n\n<h3>5.1声道基础配置</h3>\n<ol>\n  <li>前置左右主音箱：负责主要声音输出</li>\n  <li>中置音箱：对话和人声</li>\n  <li>环绕音箱：环境音效</li>\n  <li>低音炮：低频效果</li>\n</ol>\n\n<h3>音箱摆位要点</h3>\n<ul>\n  <li>主音箱与听众位置形成等边三角形</li>\n  <li>中置音箱放置在屏幕下方或上方中央</li>\n  <li>环绕音箱位于听众位置两侧稍后方</li>\n  <li>低音炮可灵活摆放，避免墙角</li>\n</ul>\n\n<h2>设备连接与设置</h2>\n\n<h3>推荐的信号链路</h3>\n<p>播放设备 → AV功放 → 显示设备</p>\n<p>这样可以确保音频和视频都得到最佳处理。</p>\n\n<h3>线材选择</h3>\n<ul>\n  <li>HDMI线：选择HDMI 2.1认证线材，支持4K 120Hz</li>\n  <li>音箱线：根据距离选择合适线径，一般14-16 AWG</li>\n  <li>电源线：使用独立电路，避免干扰</li>\n</ul>\n\n<h2>智能化升级</h2>\n\n<h3>推荐的智能设备</h3>\n<ul>\n  <li>智能灯光：Philips Hue或Yeelight</li>\n  <li>电动窗帘：自动遮光</li>\n  <li>智能插座：一键开关所有设备</li>\n  <li>万能遥控：罗技Harmony或小米万能遥控</li>\n</ul>\n\n<h2>预算分配建议</h2>\n<div style=\"background: #f0f8ff; padding: 20px; border-radius: 8px;\">\n  <ul>\n    <li>显示设备：40-50%</li>\n    <li>音响系统：30-40%</li>\n    <li>播放设备：10-15%</li>\n    <li>线材配件：5-10%</li>\n    <li>声学处理：5-10%</li>\n  </ul>\n</div>\n\n<h2>常见误区</h2>\n<ol>\n  <li><strong>误区：</strong>越大的音箱效果越好<br><strong>真相：</strong>音箱要与房间大小匹配</li>\n  <li><strong>误区：</strong>线材越贵越好<br><strong>真相：</strong>合格的线材即可，过度投资意义不大</li>\n  <li><strong>误区：</strong>功率越大越好<br><strong>真相：</strong>一般家用30-50W每声道足够</li>\n</ol>\n\n<h2>总结</h2>\n<p>打造家庭影院是一个系统工程，需要根据自己的预算、空间和需求做出平衡的选择。记住，最好的系统是适合自己的系统。从基础配置开始，逐步升级，享受这个过程带来的乐趣。</p>','家居影院','/images/related-2.jpg','王影音','/images/head2.png','15分钟',0,0,'published','2025-09-08 19:43:45','家庭影院,音响,投影仪,环绕声',NULL,NULL,NULL,0,0,NULL,'2025-09-08 19:43:45','2025-09-08 23:51:55'),(4,'五大流媒体平台对比','Netflix、Disney+、HBO哪家强？','全面对比主流流媒体平台的内容、价格、功能等方面','<h2>主流流媒体平台概览</h2>\n<p>在这个流媒体时代，选择合适的平台变得越来越重要。本文将详细对比Netflix、Disney+、HBO Max、Apple TV+和Amazon Prime Video这五大平台。</p>\n\n<h2>内容库对比</h2>\n\n<h3>Netflix（奈飞）</h3>\n<ul>\n  <li><strong>内容数量：</strong>15000+ 部影视作品</li>\n  <li><strong>原创内容：</strong>《怪奇物语》《王冠》《鱿鱼游戏》等</li>\n  <li><strong>内容类型：</strong>覆盖全球各类内容，原创剧集强大</li>\n  <li><strong>更新频率：</strong>每周都有新内容上线</li>\n</ul>\n\n<h3>Disney+（迪士尼+）</h3>\n<ul>\n  <li><strong>内容数量：</strong>8000+ 部影视作品</li>\n  <li><strong>独家内容：</strong>漫威、星战、皮克斯、国家地理</li>\n  <li><strong>内容类型：</strong>家庭向内容为主，超级英雄电影</li>\n  <li><strong>更新频率：</strong>每周更新剧集</li>\n</ul>\n\n<h3>HBO Max</h3>\n<ul>\n  <li><strong>内容数量：</strong>10000+ 部影视作品</li>\n  <li><strong>王牌内容：</strong>《权力的游戏》《西部世界》《继承之战》</li>\n  <li><strong>内容类型：</strong>高质量美剧，华纳兄弟电影</li>\n  <li><strong>更新频率：</strong>重质不重量</li>\n</ul>\n\n<h3>Apple TV+</h3>\n<ul>\n  <li><strong>内容数量：</strong>200+ 部原创作品</li>\n  <li><strong>原创精品：</strong>《晨间风云》《足球教练》《基地》</li>\n  <li><strong>内容类型：</strong>全部为高质量原创内容</li>\n  <li><strong>更新频率：</strong>每月几部新作</li>\n</ul>\n\n<h3>Amazon Prime Video</h3>\n<ul>\n  <li><strong>内容数量：</strong>12000+ 部影视作品</li>\n  <li><strong>热门内容：</strong>《黑袍纠察队》《了不起的麦瑟尔夫人》</li>\n  <li><strong>内容类型：</strong>混合原创和授权内容</li>\n  <li><strong>更新频率：</strong>稳定更新</li>\n</ul>\n\n<h2>价格对比（月费）</h2>\n\n<table style=\"width: 100%; border-collapse: collapse; margin: 20px 0;\">\n  <tr>\n    <th style=\"border: 1px solid #ddd; padding: 10px; background: #f5f5f5;\">平台</th>\n    <th style=\"border: 1px solid #ddd; padding: 10px; background: #f5f5f5;\">基础套餐</th>\n    <th style=\"border: 1px solid #ddd; padding: 10px; background: #f5f5f5;\">标准套餐</th>\n    <th style=\"border: 1px solid #ddd; padding: 10px; background: #f5f5f5;\">高级套餐</th>\n  </tr>\n  <tr>\n    <td style=\"border: 1px solid #ddd; padding: 10px;\">Netflix</td>\n    <td style=\"border: 1px solid #ddd; padding: 10px;\">$6.99（含广告）</td>\n    <td style=\"border: 1px solid #ddd; padding: 10px;\">$15.49</td>\n    <td style=\"border: 1px solid #ddd; padding: 10px;\">$22.99（4K）</td>\n  </tr>\n  <tr>\n    <td style=\"border: 1px solid #ddd; padding: 10px;\">Disney+</td>\n    <td style=\"border: 1px solid #ddd; padding: 10px;\">$7.99（含广告）</td>\n    <td style=\"border: 1px solid #ddd; padding: 10px;\">$13.99</td>\n    <td style=\"border: 1px solid #ddd; padding: 10px;\">-</td>\n  </tr>\n  <tr>\n    <td style=\"border: 1px solid #ddd; padding: 10px;\">HBO Max</td>\n    <td style=\"border: 1px solid #ddd; padding: 10px;\">$9.99（含广告）</td>\n    <td style=\"border: 1px solid #ddd; padding: 10px;\">$15.99</td>\n    <td style=\"border: 1px solid #ddd; padding: 10px;\">$19.99（4K）</td>\n  </tr>\n  <tr>\n    <td style=\"border: 1px solid #ddd; padding: 10px;\">Apple TV+</td>\n    <td style=\"border: 1px solid #ddd; padding: 10px;\">$6.99</td>\n    <td style=\"border: 1px solid #ddd; padding: 10px;\">-</td>\n    <td style=\"border: 1px solid #ddd; padding: 10px;\">-</td>\n  </tr>\n  <tr>\n    <td style=\"border: 1px solid #ddd; padding: 10px;\">Prime Video</td>\n    <td style=\"border: 1px solid #ddd; padding: 10px;\">$8.99</td>\n    <td style=\"border: 1px solid #ddd; padding: 10px;\">$14.99（含Prime会员）</td>\n    <td style=\"border: 1px solid #ddd; padding: 10px;\">-</td>\n  </tr>\n</table>\n\n<h2>功能特性对比</h2>\n\n<h3>视频质量</h3>\n<ul>\n  <li><strong>Netflix：</strong>最高4K HDR，部分内容支持杜比视界</li>\n  <li><strong>Disney+：</strong>4K HDR，IMAX Enhanced</li>\n  <li><strong>HBO Max：</strong>4K HDR（限高级套餐）</li>\n  <li><strong>Apple TV+：</strong>全部内容4K HDR，杜比视界</li>\n  <li><strong>Prime Video：</strong>4K HDR，部分内容额外收费</li>\n</ul>\n\n<h3>同时观看设备数</h3>\n<ul>\n  <li><strong>Netflix：</strong>1-4个（取决于套餐）</li>\n  <li><strong>Disney+：</strong>4个</li>\n  <li><strong>HBO Max：</strong>3个</li>\n  <li><strong>Apple TV+：</strong>6个</li>\n  <li><strong>Prime Video：</strong>3个</li>\n</ul>\n\n<h3>离线下载</h3>\n<p>所有平台都支持移动设备离线下载，但下载数量和保存时间有所限制。</p>\n\n<h2>地区可用性</h2>\n\n<div style=\"background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 8px; margin: 20px 0;\">\n  <p><strong>⚠️ 注意：</strong>部分平台在某些地区不可用或内容受限。使用前请确认您所在地区的服务可用性。</p>\n</div>\n\n<h2>用户体验对比</h2>\n\n<h3>界面设计</h3>\n<ul>\n  <li><strong>Netflix：</strong>⭐⭐⭐⭐⭐ 简洁直观，个性化推荐出色</li>\n  <li><strong>Disney+：</strong>⭐⭐⭐⭐ 清晰的品牌分类</li>\n  <li><strong>HBO Max：</strong>⭐⭐⭐ 略显复杂</li>\n  <li><strong>Apple TV+：</strong>⭐⭐⭐⭐⭐ 精美简约</li>\n  <li><strong>Prime Video：</strong>⭐⭐⭐ 需要改进</li>\n</ul>\n\n<h3>设备支持</h3>\n<p>所有平台都支持主流设备，包括：</p>\n<ul>\n  <li>智能电视（Samsung、LG、Sony等）</li>\n  <li>流媒体设备（Apple TV、Roku、Chromecast）</li>\n  <li>游戏主机（PlayStation、Xbox）</li>\n  <li>移动设备（iOS、Android）</li>\n  <li>网页浏览器</li>\n</ul>\n\n<h2>选择建议</h2>\n\n<div style=\"background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;\">\n  <h3>✅ 选择Netflix如果您：</h3>\n  <ul>\n    <li>想要最丰富的内容库</li>\n    <li>喜欢追剧和看原创内容</li>\n    <li>需要多语言字幕支持</li>\n  </ul>\n</div>\n\n<div style=\"background: #f3e5f5; padding: 20px; border-radius: 8px; margin: 20px 0;\">\n  <h3>✅ 选择Disney+如果您：</h3>\n  <ul>\n    <li>有孩子的家庭</li>\n    <li>漫威/星战粉丝</li>\n    <li>喜欢经典动画</li>\n  </ul>\n</div>\n\n<div style=\"background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;\">\n  <h3>✅ 选择HBO Max如果您：</h3>\n  <ul>\n    <li>追求高质量美剧</li>\n    <li>喜欢HBO经典作品</li>\n    <li>想第一时间看华纳新片</li>\n  </ul>\n</div>\n\n<h2>组合订阅策略</h2>\n<p>很多用户选择订阅多个平台，以下是一些推荐组合：</p>\n<ul>\n  <li><strong>家庭套餐：</strong>Netflix + Disney+（全面覆盖）</li>\n  <li><strong>影迷套餐：</strong>Netflix + HBO Max（质量优先）</li>\n  <li><strong>经济套餐：</strong>Apple TV+（单独）或 Prime Video（含其他权益）</li>\n</ul>\n\n<h2>总结</h2>\n<p>没有一个平台能满足所有需求。Netflix仍是内容最全面的选择，Disney+垄断了家庭娱乐市场，HBO Max提供最优质的成人向内容，Apple TV+虽小而精，Prime Video则提供了不错的性价比。根据您的观看习惯和预算，选择最适合的平台或组合。记住，大部分平台都提供免费试用期，不妨先体验再决定。</p>','流媒体','/images/related-3.jpg','赵媒体','/images/head3.png','12分钟',0,0,'published','2025-09-08 19:43:45','Netflix,Disney+,HBO,流媒体,对比',NULL,NULL,NULL,0,0,NULL,'2025-09-08 19:43:45','2025-09-08 23:51:55');
/*!40000 ALTER TABLE `articles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `binance_recharges`
--

DROP TABLE IF EXISTS `binance_recharges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `binance_recharges` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `orderId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT 'USDT',
  `txHash` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pending','completed','failed') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `network` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fee` decimal(10,2) DEFAULT '0.00',
  `actualAmount` decimal(10,2) DEFAULT NULL,
  `exchangeRate` decimal(10,4) DEFAULT NULL,
  `cnyAmount` decimal(10,2) DEFAULT NULL,
  `completedTime` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `orderId` (`orderId`),
  UNIQUE KEY `orderId_2` (`orderId`),
  UNIQUE KEY `orderId_3` (`orderId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `binance_recharges`
--

LOCK TABLES `binance_recharges` WRITE;
/*!40000 ALTER TABLE `binance_recharges` DISABLE KEYS */;
/*!40000 ALTER TABLE `binance_recharges` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `code` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `icon` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order` int DEFAULT '0',
  `questionCount` int DEFAULT '0',
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  UNIQUE KEY `code_2` (`code`),
  UNIQUE KEY `code_3` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cdk_usage_records`
--

DROP TABLE IF EXISTS `cdk_usage_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cdk_usage_records` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '使用记录ID',
  `cdk_id` bigint NOT NULL COMMENT 'CDK ID',
  `cdk_code` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'CDK码',
  `user_id` bigint NOT NULL COMMENT '使用者ID',
  `order_id` bigint DEFAULT NULL COMMENT '关联订单ID',
  `usage_type` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'normal' COMMENT '使用类型：normal-正常使用, redeem-兑换, activate-激活',
  `usage_status` tinyint DEFAULT '1' COMMENT '使用状态 0:失败 1:成功 2:已释放',
  `used_at` datetime DEFAULT NULL COMMENT '使用时间',
  `expire_at` datetime DEFAULT NULL COMMENT '本次使用的过期时间',
  `released_at` datetime DEFAULT NULL COMMENT '释放时间',
  `release_reason` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '释放原因：expired-过期, manual-手动, system-系统',
  `ip_address` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '使用时的IP地址',
  `user_agent` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '使用时的User Agent',
  `device_info` json DEFAULT NULL COMMENT '设备信息',
  `remark` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '备注',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `cdk_id` (`cdk_id`),
  KEY `user_id` (`user_id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `cdk_usage_records_ibfk_1` FOREIGN KEY (`cdk_id`) REFERENCES `pr_goods_cdkey` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `cdk_usage_records_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `cdk_usage_records_ibfk_3` FOREIGN KEY (`order_id`) REFERENCES `order` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cdk_usage_records`
--

LOCK TABLES `cdk_usage_records` WRITE;
/*!40000 ALTER TABLE `cdk_usage_records` DISABLE KEYS */;
/*!40000 ALTER TABLE `cdk_usage_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coupon`
--

DROP TABLE IF EXISTS `coupon`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coupon` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '优惠券ID',
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '优惠券名称',
  `code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '优惠券兑换码',
  `type` tinyint DEFAULT '1' COMMENT '优惠券类型 1:满减券 2:折扣券 3:现金券',
  `value` decimal(10,2) NOT NULL COMMENT '优惠券面值或折扣',
  `min_amount` decimal(10,2) DEFAULT '0.00' COMMENT '最低使用金额',
  `max_discount` decimal(10,2) DEFAULT NULL COMMENT '最高优惠金额（折扣券）',
  `total_count` int DEFAULT '1' COMMENT '发放总量',
  `used_count` int DEFAULT '0' COMMENT '已使用数量',
  `start_time` datetime NOT NULL COMMENT '生效时间',
  `end_time` datetime NOT NULL COMMENT '失效时间',
  `status` tinyint DEFAULT '1' COMMENT '状态 0:禁用 1:启用',
  `description` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '优惠券描述',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  UNIQUE KEY `code_2` (`code`),
  UNIQUE KEY `code_3` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupon`
--

LOCK TABLES `coupon` WRITE;
/*!40000 ALTER TABLE `coupon` DISABLE KEYS */;
/*!40000 ALTER TABLE `coupon` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `delivery_record`
--

DROP TABLE IF EXISTS `delivery_record`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `delivery_record` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '发货记录ID',
  `order_id` bigint NOT NULL COMMENT '订单ID',
  `product_id` bigint NOT NULL COMMENT '商品ID',
  `cdk_id` bigint DEFAULT NULL COMMENT 'CDK ID',
  `cdk_code` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'CDK码',
  `delivery_type` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'auto' COMMENT '发货类型：auto-自动发货, manual-手动发货',
  `delivery_status` tinyint DEFAULT '1' COMMENT '发货状态 0:失败 1:成功',
  `delivery_method` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '发货方式：email-邮件, system-系统内, api-API推送',
  `delivery_content` text COLLATE utf8mb4_unicode_ci COMMENT '发货内容（CDK信息或其他）',
  `recipient_email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '接收邮箱',
  `operator_id` bigint DEFAULT NULL COMMENT '操作员ID（手动发货时）',
  `operator_name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '操作员名称',
  `failure_reason` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '失败原因',
  `retry_count` int DEFAULT '0' COMMENT '重试次数',
  `delivered_at` datetime DEFAULT NULL COMMENT '发货时间',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `delivery_record_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `order` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `delivery_record`
--

LOCK TABLES `delivery_record` WRITE;
/*!40000 ALTER TABLE `delivery_record` DISABLE KEYS */;
INSERT INTO `delivery_record` VALUES (1,2,1,10,'NETFLIX-F4JS-NRAK-BDKI','auto',1,'system','{\"cdkCode\":\"NETFLIX-F4JS-NRAK-BDKI\",\"cdkType\":\"account\",\"expireDate\":\"2026-09-02T05:30:04.000Z\",\"accountInfo\":null}','test@example.com',NULL,NULL,NULL,0,'2025-09-13 12:07:11','2025-09-13 12:07:11','2025-09-13 12:07:11'),(2,39,10,66,'VIDEO1111-3QF4-BKF5-O0Z9-4RTN','auto',1,'system','{\"cdkCode\":\"VIDEO1111-3QF4-BKF5-O0Z9-4RTN\",\"cdkType\":\"normal\",\"expireDate\":null,\"accountInfo\":null}','cuidong111@gmail.com',NULL,NULL,NULL,0,'2025-09-13 12:08:20','2025-09-13 12:08:20','2025-09-13 12:08:20'),(3,40,10,67,'VIDEO1111-FX12-CGYT-87BX-OFG2','auto',1,'system','{\"cdkCode\":\"VIDEO1111-FX12-CGYT-87BX-OFG2\",\"cdkType\":\"normal\",\"expireDate\":null,\"accountInfo\":null}','cuidong111@gmail.com',NULL,NULL,NULL,0,'2025-09-14 07:37:29','2025-09-14 07:37:29','2025-09-14 07:37:29'),(4,41,11,NULL,NULL,'auto',0,NULL,NULL,NULL,NULL,NULL,'CDK库存不足，无法自动发货',0,'2025-09-14 08:41:10','2025-09-14 08:41:10','2025-09-14 08:41:10'),(6,47,1,NULL,'TEST_CDK_002','manual',1,'admin','TEST_CDK_002','test@example.com',NULL,'Admin',NULL,0,'2025-09-14 13:12:03','2025-09-14 13:12:03','2025-09-14 13:12:03'),(7,41,11,NULL,'RECHARGE_1757847836','manual',1,'admin','RECHARGE_1757847836','cuidong111@gmail.com',NULL,'Admin',NULL,0,'2025-09-14 15:58:48','2025-09-14 15:58:48','2025-09-14 15:58:48'),(8,52,11,NULL,'RECHARGE_1757847836','manual',1,'admin','RECHARGE_1757847836','cuidong111@gmail.com',NULL,'Admin',NULL,0,'2025-09-14 23:43:58','2025-09-14 23:43:58','2025-09-14 23:43:58'),(9,55,11,NULL,'RECHARGE_1757847836','manual',1,'admin','RECHARGE_1757847836','cuidong111@gmail.com',NULL,'Admin',NULL,0,'2025-09-15 01:04:33','2025-09-15 01:04:33','2025-09-15 01:04:33'),(10,57,11,NULL,'RECHARGE_1757847836','manual',1,'admin','RECHARGE_1757847836','cuidong111@gmail.com',NULL,'Admin',NULL,0,'2025-09-15 01:44:59','2025-09-15 01:44:59','2025-09-15 01:44:59'),(11,59,11,NULL,'RECHARGE_1757847836','manual',1,'admin','RECHARGE_1757847836','cuidong111@gmail.com',NULL,'Admin',NULL,0,'2025-09-15 01:49:22','2025-09-15 01:49:22','2025-09-15 01:49:22');
/*!40000 ALTER TABLE `delivery_record` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `discount_activities`
--

DROP TABLE IF EXISTS `discount_activities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `discount_activities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '活动名称',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '活动描述',
  `discount_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'percentage' COMMENT '折扣类型: percentage(百分比折扣), fixed(固定金额)',
  `discount_value` decimal(10,2) NOT NULL COMMENT '折扣值: 如9折则为90, 减10元则为10',
  `min_purchase_amount` decimal(10,2) DEFAULT '0.00' COMMENT '最低消费金额',
  `max_discount_amount` decimal(10,2) DEFAULT NULL COMMENT '最高折扣金额限制',
  `start_time` datetime NOT NULL COMMENT '活动开始时间',
  `end_time` datetime NOT NULL COMMENT '活动结束时间',
  `status` int DEFAULT '1' COMMENT '状态: 0-禁用, 1-启用',
  `apply_to_all_products` tinyint(1) DEFAULT '1' COMMENT '是否应用于所有商品',
  `product_ids` text COLLATE utf8mb4_unicode_ci COMMENT '指定商品ID列表(JSON格式)',
  `category_ids` text COLLATE utf8mb4_unicode_ci COMMENT '指定分类ID列表(JSON格式)',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `discount_activities`
--

LOCK TABLES `discount_activities` WRITE;
/*!40000 ALTER TABLE `discount_activities` DISABLE KEYS */;
INSERT INTO `discount_activities` VALUES (1,'限时9折优惠','全场商品限时9折优惠活动','percentage',80.00,0.00,NULL,'2025-09-13 22:38:40','2025-10-14 22:38:40',1,0,'[11,7,4]','[]','2025-09-14 22:38:40','2025-09-14 16:06:37');
/*!40000 ALTER TABLE `discount_activities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `email_codes`
--

DROP TABLE IF EXISTS `email_codes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `email_codes` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '邮箱',
  `code` varchar(6) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '验证码',
  `type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '类型：login-登录，register-注册，reset-重置密码',
  `used` tinyint DEFAULT '0' COMMENT '是否已使用：0-未使用，1-已使用',
  `expires_at` datetime NOT NULL COMMENT '过期时间',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `email_codes`
--

LOCK TABLES `email_codes` WRITE;
/*!40000 ALTER TABLE `email_codes` DISABLE KEYS */;
INSERT INTO `email_codes` VALUES (1,'test@example.com','968780','register',1,'2025-09-08 14:59:48','2025-09-08 06:49:47'),(2,'cuidong111@gmail','466300','register',0,'2025-09-12 18:09:00','2025-09-12 09:59:00'),(3,'cuidong111@gmail.com','960164','register',1,'2025-09-12 18:09:10','2025-09-12 09:59:10'),(4,'cuidong111@gmail.com','127053','register',1,'2025-09-12 18:09:13','2025-09-12 09:59:13'),(5,'cuidong111@gmail.com','133041','register',1,'2025-09-12 18:09:14','2025-09-12 09:59:13'),(6,'cuidong111@gmail.com','490434','register',1,'2025-09-12 18:09:14','2025-09-12 09:59:13'),(7,'test@example.com','653223','register',1,'2025-09-12 18:17:46','2025-09-12 10:07:46'),(8,'cuidong111@gmail.com','055883','register',1,'2025-09-12 18:18:53','2025-09-12 10:08:53'),(9,'test@gmail.com','945352','register',1,'2025-09-12 18:30:16','2025-09-12 10:20:16'),(10,'test@gmail.com','230792','register',1,'2025-09-12 18:31:07','2025-09-12 10:21:06'),(11,'test@example.com','824613','register',1,'2025-09-12 22:02:24','2025-09-12 13:52:24'),(12,'test@example.com','230265','register',1,'2025-09-12 22:06:21','2025-09-12 13:56:21'),(13,'test@example.com','757491','register',1,'2025-09-12 22:07:02','2025-09-12 13:57:01'),(14,'test@gmail.com','087263','register',0,'2025-09-12 22:14:40','2025-09-12 14:04:40'),(15,'cuidong111@gmail.com','759801','register',1,'2025-09-12 22:15:06','2025-09-12 14:05:05'),(16,'invalid-email','597103','register',0,'2025-09-12 22:17:16','2025-09-12 14:07:16'),(17,'test@example.com','984701','register',1,'2025-09-12 22:17:57','2025-09-12 14:07:57'),(18,'cuidong111@gmail.com','206954','register',1,'2025-09-12 22:19:09','2025-09-12 14:09:09'),(19,'test@example.com','026133','register',0,'2025-09-12 22:38:01','2025-09-12 14:28:00'),(20,'cuidong111@gmail.com','888939','register',1,'2025-09-12 22:41:42','2025-09-12 14:31:42'),(21,'cuidong111@gmail.com','865707','register',1,'2025-09-12 22:48:29','2025-09-12 14:38:29'),(22,'cuidong111@gmail.com','542018','register',1,'2025-09-12 22:49:44','2025-09-12 14:39:44'),(23,'your-email@gmail.com','060215','register',0,'2025-09-12 23:06:41','2025-09-12 14:56:41'),(24,'your-email@gmail.com','208316','login',0,'2025-09-12 23:06:45','2025-09-12 14:56:44'),(25,'your-email@gmail.com','352833','reset',0,'2025-09-12 23:06:48','2025-09-12 14:56:47'),(26,'cuidong111@gmail.com','903155','register',1,'2025-09-12 23:07:07','2025-09-12 14:57:06'),(27,'cuidong111@gmail.com','648668','login',1,'2025-09-12 23:07:11','2025-09-12 14:57:10'),(28,'cuidong111@gmail.com','448584','reset',1,'2025-09-12 23:07:13','2025-09-12 14:57:13'),(29,'cuidong111@gmail.com','590470','register',1,'2025-09-12 23:17:04','2025-09-12 15:07:03'),(30,'cuidong111@gmail.com','566795','login',0,'2025-09-12 23:17:08','2025-09-12 15:07:07'),(31,'cuidong111@gmail.com','375740','reset',0,'2025-09-12 23:17:10','2025-09-12 15:07:10'),(32,'cuidong111@gmail.com','977116','register',1,'2025-09-12 23:26:51','2025-09-12 15:16:50'),(33,'cuidong111@gmail.com','214169','register',1,'2025-09-12 23:27:53','2025-09-12 15:17:53'),(34,'cuidong111@gmail.com','105135','register',1,'2025-09-12 23:27:55','2025-09-12 15:17:55'),(36,'cuidong111@gmail.com','583435','register',1,'2025-09-12 23:33:44','2025-09-12 15:23:43'),(38,'cuidong111@gmail.com','276264','register',1,'2025-09-12 23:47:34','2025-09-12 15:37:33'),(41,'testuser999@example.com','030371','register',1,'2025-09-12 23:50:30','2025-09-12 15:40:30'),(42,'newtest@example.com','252911','register',1,'2025-09-12 23:51:30','2025-09-12 15:41:30'),(43,'test1757691710@example.com','231339','register',1,'2025-09-12 23:51:50','2025-09-12 15:41:50'),(44,'cuidong111@gmail.com','227342','register',1,'2025-09-12 23:52:52','2025-09-12 15:42:51'),(45,'cuidong111@gmail.com','700255','register',1,'2025-09-13 00:10:15','2025-09-12 16:00:14'),(46,'newuser_1757693282408@example.com','322744','register',0,'2025-09-13 00:18:02','2025-09-12 16:08:02'),(47,'test2@example.com','628140','register',0,'2025-09-13 00:18:05','2025-09-12 16:08:04'),(48,'cuidong111@gmail.com','005883','register',1,'2025-09-13 00:18:47','2025-09-12 16:08:46'),(49,'cuidong111@gmail.com','883843','register',1,'2025-09-14 19:25:28','2025-09-14 11:15:27'),(50,'cuidong111@gmail.com','242947','register',1,'2025-09-14 19:25:29','2025-09-14 11:15:28'),(51,'cuidong111@gmail.com','811832','register',1,'2025-09-14 19:27:43','2025-09-14 11:17:43'),(52,'cuidong111@gmail.com','704635','register',1,'2025-09-14 19:28:53','2025-09-14 11:18:53');
/*!40000 ALTER TABLE `email_codes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `email_config`
--

DROP TABLE IF EXISTS `email_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `email_config` (
  `id` int NOT NULL AUTO_INCREMENT,
  `config_key` varchar(100) NOT NULL,
  `config_value` text,
  `description` varchar(255) DEFAULT NULL,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_config_key` (`config_key`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='邮件配置表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `email_config`
--

LOCK TABLES `email_config` WRITE;
/*!40000 ALTER TABLE `email_config` DISABLE KEYS */;
INSERT INTO `email_config` VALUES (1,'enabled','true','是否启用邮件服务','2025-09-13 12:14:40'),(2,'auto_delivery_email','true','是否发送自动发货邮件','2025-09-13 12:14:40'),(3,'manual_pending_email','true','是否发送手动发货待处理邮件','2025-09-13 12:14:40'),(4,'manual_complete_email','true','是否发送手动发货完成邮件','2025-09-13 12:14:40');
/*!40000 ALTER TABLE `email_config` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `email_logs`
--

DROP TABLE IF EXISTS `email_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `email_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `recipient` varchar(255) NOT NULL COMMENT '收件人邮箱',
  `subject` varchar(255) DEFAULT NULL COMMENT '邮件主题',
  `content` text COMMENT '邮件内容',
  `type` varchar(50) DEFAULT 'custom' COMMENT '邮件类型',
  `order_no` varchar(100) DEFAULT NULL COMMENT '关联订单号',
  `status` varchar(20) DEFAULT 'pending' COMMENT '发送状态：pending, success, failed',
  `message_id` varchar(255) DEFAULT NULL COMMENT '邮件服务商返回的消息ID',
  `error_message` text COMMENT '错误信息',
  `sent_at` datetime DEFAULT NULL COMMENT '发送时间',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_recipient` (`recipient`),
  KEY `idx_order_no` (`order_no`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='邮件发送日志表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `email_logs`
--

LOCK TABLES `email_logs` WRITE;
/*!40000 ALTER TABLE `email_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `email_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `email_templates`
--

DROP TABLE IF EXISTS `email_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `email_templates` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL COMMENT '模板名称',
  `type` varchar(50) NOT NULL COMMENT '模板类型：auto_delivery, manual_pending, manual_complete, custom',
  `subject` varchar(255) NOT NULL COMMENT '邮件主题',
  `content` text NOT NULL COMMENT '邮件内容',
  `content_type` varchar(20) DEFAULT 'html' COMMENT '内容类型：html, text',
  `enabled` tinyint(1) DEFAULT '1' COMMENT '是否启用',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_type` (`type`),
  KEY `idx_enabled` (`enabled`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='邮件模板表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `email_templates`
--

LOCK TABLES `email_templates` WRITE;
/*!40000 ALTER TABLE `email_templates` DISABLE KEYS */;
/*!40000 ALTER TABLE `email_templates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL COMMENT '用户ID',
  `type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '通知类型: order_update, receipt_approved, receipt_rejected, system',
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '通知标题',
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '通知内容',
  `relatedType` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '关联类型: order, receipt, etc',
  `relatedId` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '关联ID: 订单号等',
  `isRead` tinyint(1) DEFAULT '0' COMMENT '是否已读',
  `readAt` datetime DEFAULT NULL COMMENT '阅读时间',
  `metadata` json DEFAULT NULL COMMENT '额外数据',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `notifications_user_id_is_read` (`userId`,`isRead`),
  KEY `notifications_user_id_created_at` (`userId`,`createdAt`),
  KEY `notifications_related_type_related_id` (`relatedType`,`relatedId`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (2,12,'receipt_approved','回执修改申请已通过','您的订单 ORD1757839240567870 的回执修改申请已通过，回执单已更新为您提交的新数据。','order','ORD1757839240567870',1,'2025-09-14 15:21:58','{\"reason\": null, \"status\": \"approved\", \"orderNo\": \"ORD1757839240567870\"}','2025-09-14 14:02:33','2025-09-14 15:21:58');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order`
--

DROP TABLE IF EXISTS `order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '订单ID',
  `order_no` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '订单编号',
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `product_id` bigint NOT NULL COMMENT '商品ID',
  `product_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '商品名称',
  `quantity` int DEFAULT '1' COMMENT '购买数量',
  `unit_price` decimal(10,2) NOT NULL COMMENT '单价',
  `total_amount` decimal(10,2) NOT NULL COMMENT '总金额',
  `payment_method` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '支付方式：wechat, alipay, card等',
  `payment_status` tinyint DEFAULT '0' COMMENT '支付状态 0:待支付 1:已支付 2:支付失败',
  `delivery_status` tinyint DEFAULT '0' COMMENT '发货状态 0:待发货 1:部分发货 2:已发货 3:发货失败',
  `delivery_mode` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'auto' COMMENT '发货方式：auto-自动发货, manual-手动发货',
  `order_status` tinyint DEFAULT '0' COMMENT '订单状态 0:待处理 1:处理中 2:已完成 3:已取消 4:已退款',
  `remark` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '备注',
  `user_email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '用户邮箱（用于发送CDK）',
  `paid_at` datetime DEFAULT NULL COMMENT '支付时间',
  `delivered_at` datetime DEFAULT NULL COMMENT '发货时间',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL COMMENT '完成时间（确认收货时间）',
  `sku` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '商品SKU',
  `sale_price` decimal(10,2) DEFAULT NULL COMMENT '销售价格',
  `product_image` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '商品图片',
  `consumer_nickname` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '消费者昵称',
  `expire_time` datetime DEFAULT NULL COMMENT '过期时间',
  `process_status` tinyint DEFAULT '0' COMMENT '处理状态',
  `delivery_requires_receipt` tinyint(1) DEFAULT '0',
  `has_receipt` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_no` (`order_no`),
  UNIQUE KEY `order_no_2` (`order_no`),
  UNIQUE KEY `order_no_3` (`order_no`)
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order`
--

LOCK TABLES `order` WRITE;
/*!40000 ALTER TABLE `order` DISABLE KEYS */;
INSERT INTO `order` VALUES (1,'TEST202501021234',1,1,'测试商品',1,100.00,100.00,'alipay',1,2,'auto',2,' [系统自动完成]','test@example.com',NULL,'2025-09-06 14:16:45','2025-09-02 19:42:02','2025-09-06 14:16:45','2025-09-15 00:05:13',NULL,NULL,NULL,NULL,NULL,0,1,0),(2,'ORD1756815294481581',0,1,'Netflix 高级账号 12个月',2,320.00,640.00,'alipay',1,1,'auto',1,'','test@example.com','2025-09-02 22:41:56','2025-09-13 12:07:11','2025-09-02 12:14:54','2025-09-13 12:07:11',NULL,NULL,NULL,NULL,NULL,NULL,0,1,0),(4,'ORD1757169307758727',1,1,'Netflix 高级账号 12个月',1,320.00,320.00,'alipay',0,0,'auto',3,'','test@example.com',NULL,NULL,'2025-09-06 14:35:07','2025-09-08 15:03:09',NULL,NULL,NULL,NULL,NULL,NULL,0,1,0),(5,'ORD1757169315232809',1,8,'Claude Pro 1个月',1,158.00,158.00,'alipay',0,0,'auto',3,'','test@example.com',NULL,NULL,'2025-09-06 14:35:15','2025-09-08 15:03:12',NULL,NULL,NULL,NULL,NULL,NULL,0,0,0),(6,'ORD175717074600221',1,1,'Netflix 高级账号 12个月',1,320.00,320.00,'alipay',0,0,'auto',3,'系统自动取消：超过15分钟未支付','test@example.com',NULL,NULL,'2025-09-06 14:59:06','2025-09-08 15:09:00',NULL,NULL,NULL,NULL,NULL,NULL,0,1,0),(7,'ORD1757260235062405',4,9,'测试商品',1,0.01,0.01,'alipay',0,0,'auto',3,'系统自动取消：超过15分钟未支付','333@gamil.com',NULL,NULL,'2025-09-07 15:50:35','2025-09-08 15:09:00',NULL,NULL,NULL,NULL,NULL,NULL,0,0,0),(8,'ORD1757261930084149',4,10,'测试商品2',1,0.03,0.03,'alipay',0,0,'auto',3,'系统自动取消：超过15分钟未支付','333@gamil.com',NULL,NULL,'2025-09-07 16:18:50','2025-09-08 15:09:00',NULL,NULL,NULL,NULL,NULL,NULL,0,0,0),(9,'ORD1757262220738496',4,1,'Netflix 高级账号 12个月',1,320.00,320.00,'alipay',0,0,'auto',3,'系统自动取消：超过15分钟未支付','333@gamil.com',NULL,NULL,'2025-09-07 16:23:40','2025-09-08 15:09:00',NULL,NULL,NULL,NULL,NULL,NULL,0,1,0),(10,'ORD1757262225323378',4,2,'Disney+ 会员 6个月',1,168.00,168.00,'alipay',0,0,'auto',3,'系统自动取消：超过15分钟未支付','333@gamil.com',NULL,NULL,'2025-09-07 16:23:45','2025-09-08 15:09:00',NULL,NULL,NULL,NULL,NULL,NULL,0,0,0),(18,'ORD1757318795407830',1,9,'测试商品',1,0.01,0.01,'wechat',1,2,'auto',2,'商品已发货 [系统自动完成]','test@example.com','2025-09-08 17:16:54','2025-09-10 02:46:44','2025-09-08 08:06:35','2025-09-10 02:46:44','2025-09-15 00:05:13',NULL,NULL,NULL,NULL,NULL,0,0,0),(20,'ORD1757322188693408',1,9,'测试商品',1,0.01,0.01,'wechat',1,2,'manual',2,'发货内容: 商品已发货 [系统自动完成]','test@example.com','2025-09-08 17:16:49','2025-09-10 02:46:07','2025-09-08 09:03:08','2025-09-10 02:46:07','2025-09-15 00:05:13',NULL,NULL,NULL,NULL,NULL,0,0,0),(21,'ORD1757329913087806',1,10,'测试商品2',1,0.03,0.03,'wechat',1,2,'manual',2,'发货内容: 商品已发货; 用户已确认收货; 用户已确认收货; 用户已确认收货','test@example.com','2025-09-08 19:12:11','2025-09-10 02:45:40','2025-09-08 11:11:53','2025-09-10 03:07:26','2025-09-10 03:07:26',NULL,NULL,NULL,NULL,NULL,0,0,0),(22,'ORD1757334652850713',1,2,'Disney+ 会员 6个月',1,168.00,168.00,NULL,0,0,'auto',3,'系统自动取消：超过15分钟未支付','test@example.com',NULL,NULL,'2025-09-08 12:30:52','2025-09-08 15:09:00',NULL,NULL,NULL,NULL,NULL,NULL,0,0,0),(39,'ORD1757750617969444',12,10,'测试商品2',1,0.02,0.02,'wechat',1,2,'auto',2,'规格: 1个月 | 套餐: 1个月','cuidong111@gmail.com','2025-09-13 16:03:54','2025-09-13 12:08:20','2025-09-13 08:03:37','2025-09-13 12:08:20','2025-09-13 12:08:20','SKU1757591686653_0|1个月',NULL,NULL,NULL,NULL,0,0,0),(40,'ORD1757835430272665',12,10,'测试商品2',1,0.02,0.02,'wechat',1,2,'auto',2,'规格: 1个月 | 套餐: 1个月','cuidong111@gmail.com','2025-09-14 15:37:27','2025-09-14 07:37:29','2025-09-14 07:37:10','2025-09-14 07:37:29','2025-09-14 07:37:29','SKU1757591686653_0|1个月',NULL,NULL,NULL,NULL,0,0,0),(41,'ORD1757839240567870',12,11,'代充服务呀',1,0.02,0.02,'wechat',1,2,'manual',2,'RECHARGE_1757847836','cuidong111@gmail.com','2025-09-14 16:41:08','2025-09-14 15:58:48','2025-09-14 08:40:40','2025-09-14 15:58:48','2025-09-14 15:58:48',NULL,NULL,NULL,NULL,NULL,0,1,1),(47,'TEST_PROXY_ORDER_001',13,1,'代充服务呀',1,100.00,100.00,NULL,1,2,'manual',2,'TEST_CDK_002','test@example.com',NULL,'2025-09-14 13:12:03','2025-09-14 17:26:58','2025-09-14 13:12:03','2025-09-14 13:12:03',NULL,NULL,NULL,NULL,NULL,0,1,1),(48,'ORD175786539017663',12,11,'代充服务呀',1,0.02,0.02,NULL,0,0,'auto',3,'套餐:  [手动取消测试订单]','cuidong111@gmail.com',NULL,NULL,'2025-09-14 15:56:30','2025-09-14 15:56:30',NULL,NULL,NULL,NULL,NULL,NULL,0,1,0),(49,'ORD1757865839884554',12,11,'代充服务呀',1,0.02,0.02,NULL,0,0,'auto',3,'折扣: 限时9折优惠 (90.00折) [手动取消测试订单]','cuidong111@gmail.com',NULL,NULL,'2025-09-14 16:03:59','2025-09-14 16:03:59',NULL,NULL,NULL,NULL,NULL,NULL,0,1,0),(50,'ORD1757865843612910',12,11,'代充服务呀',1,0.02,0.02,NULL,0,0,'auto',3,'折扣: 限时9折优惠 (90.00折) [手动取消测试订单]','cuidong111@gmail.com',NULL,NULL,'2025-09-14 16:04:03','2025-09-14 16:04:03',NULL,NULL,NULL,NULL,NULL,NULL,0,1,0),(51,'ORD175786589406712',12,11,'代充服务呀',1,0.02,0.02,NULL,0,0,'auto',3,'折扣: 限时9折优惠 (90.00折) [手动取消测试订单]','cuidong111@gmail.com',NULL,NULL,'2025-09-14 16:04:54','2025-09-14 16:04:54',NULL,NULL,NULL,NULL,NULL,NULL,0,1,0),(52,'ORD175786600004559',12,11,'代充服务呀',1,0.04,0.04,'wechat',1,2,'manual',2,'RECHARGE_1757847836','cuidong111@gmail.com','2025-09-15 00:07:01','2025-09-14 23:43:58','2025-09-14 16:06:40','2025-09-14 23:43:58','2025-09-14 23:43:58',NULL,NULL,NULL,NULL,NULL,0,1,0),(53,'ORD1757893329153933',12,11,'代充服务呀',1,0.04,0.04,NULL,0,0,'auto',3,'系统自动取消：超过15分钟未支付','cuidong111@gmail.com',NULL,NULL,'2025-09-14 23:42:09','2025-09-14 23:58:00',NULL,NULL,NULL,NULL,NULL,NULL,0,1,0),(55,'ORD1757893744768983',12,11,'代充服务呀',1,0.04,0.04,'wechat',1,2,'manual',2,'RECHARGE_1757847836','cuidong111@gmail.com','2025-09-15 07:50:59','2025-09-15 01:04:33','2025-09-14 23:49:04','2025-09-15 01:04:33','2025-09-15 01:04:33',NULL,NULL,NULL,NULL,NULL,0,1,0),(56,'ORD1757894485973697',12,11,'代充服务呀',1,0.04,0.04,NULL,0,0,'auto',3,'系统自动取消：超过15分钟未支付','cuidong111@gmail.com',NULL,NULL,'2025-09-15 00:01:25','2025-09-15 00:17:00',NULL,NULL,NULL,NULL,NULL,NULL,0,1,0),(57,'ORD1757895227402922',12,11,'代充服务呀',1,0.04,0.04,'wechat',1,2,'manual',2,'RECHARGE_1757847836','cuidong111@gmail.com','2025-09-15 08:17:20','2025-09-15 01:44:59','2025-09-15 00:13:47','2025-09-15 01:44:59','2025-09-15 01:44:59',NULL,NULL,NULL,NULL,NULL,0,1,0),(58,'ORD1757900903827123',12,11,'代充服务呀',1,0.04,0.04,NULL,0,0,'auto',3,'系统自动取消：超过15分钟未支付','cuidong111@gmail.com',NULL,NULL,'2025-09-15 01:48:23','2025-09-15 02:04:00',NULL,NULL,NULL,NULL,NULL,NULL,0,0,0),(59,'ORD1757900908721815',12,11,'代充服务呀',1,0.04,0.04,'wechat',1,2,'manual',2,'RECHARGE_1757847836','cuidong111@gmail.com','2025-09-15 09:48:41','2025-09-15 01:49:22','2025-09-15 01:48:28','2025-09-15 01:49:22','2025-09-15 01:49:22',NULL,NULL,NULL,NULL,NULL,0,0,0);
/*!40000 ALTER TABLE `order` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pr_banner`
--

DROP TABLE IF EXISTS `pr_banner`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pr_banner` (
  `id` int NOT NULL AUTO_INCREMENT,
  `img` varchar(500) DEFAULT NULL COMMENT '图片地址',
  `link` varchar(500) DEFAULT NULL COMMENT '跳转链接',
  `title` varchar(200) DEFAULT NULL COMMENT '标题',
  `order_num` int DEFAULT '0' COMMENT '排序号',
  `is_visible` tinyint DEFAULT '1' COMMENT '是否显示',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='轮播图表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pr_banner`
--

LOCK TABLES `pr_banner` WRITE;
/*!40000 ALTER TABLE `pr_banner` DISABLE KEYS */;
INSERT INTO `pr_banner` VALUES (1,'/images/test2.jpg','https://edited.com','编辑测试成功',99,0,'2025-09-02 02:41:47','2025-09-14 12:05:45'),(2,'https://via.placeholder.com/1920x480/4ECDC4/FFFFFF?text=Premium+Services','','优质服务',2,0,'2025-09-02 02:41:47','2025-09-14 12:05:58'),(3,'https://via.placeholder.com/1920x480/45B7D1/FFFFFF?text=Special+Offers','/products','特别优惠',3,0,'2025-09-02 02:41:47','2025-09-14 12:05:44'),(4,'/uploads/image-1757851492789-532206210.png','','风景照片',1,1,'2025-09-13 12:37:17','2025-09-14 12:05:02'),(5,'/uploads/image-1757851515025-495348032.png','','11111',2,1,'2025-09-13 12:37:17','2025-09-14 12:05:31');
/*!40000 ALTER TABLE `pr_banner` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pr_cart`
--

DROP TABLE IF EXISTS `pr_cart`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pr_cart` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL COMMENT '用户ID',
  `product_id` int NOT NULL COMMENT '商品ID',
  `sku_name` varchar(255) DEFAULT NULL COMMENT 'SKU规格名称',
  `sku_price` decimal(10,2) DEFAULT NULL COMMENT 'SKU价格',
  `quantity` int NOT NULL DEFAULT '1' COMMENT '数量',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '添加时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_product_sku` (`user_id`,`product_id`,`sku_name`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_product_id` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='购物车表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pr_cart`
--

LOCK TABLES `pr_cart` WRITE;
/*!40000 ALTER TABLE `pr_cart` DISABLE KEYS */;
INSERT INTO `pr_cart` VALUES (1,4,9,NULL,NULL,1,'2025-09-08 07:06:55','2025-09-08 07:06:55');
/*!40000 ALTER TABLE `pr_cart` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pr_category`
--

DROP TABLE IF EXISTS `pr_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pr_category` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL COMMENT '分类名称',
  `description` varchar(200) DEFAULT NULL COMMENT '分类描述',
  `sort_order` int DEFAULT '0' COMMENT '排序',
  `status` tinyint DEFAULT '1' COMMENT '状态：1-启用，0-禁用',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `category_name` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='商品分类表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pr_category`
--

LOCK TABLES `pr_category` WRITE;
/*!40000 ALTER TABLE `pr_category` DISABLE KEYS */;
INSERT INTO `pr_category` VALUES (3,'视频音乐',NULL,3,1,'2025-09-06 21:11:31','2025-09-06 21:11:31','视频音乐'),(4,'Vtuber',NULL,4,1,'2025-09-06 21:11:31','2025-09-06 21:11:31','Vtuber'),(8,'代充代付',NULL,8,1,'2025-09-06 21:11:31','2025-09-06 21:11:31','代充代付'),(9,'游戏',NULL,9,1,'2025-09-06 21:11:31','2025-09-06 21:11:31','游戏'),(10,'卡劵',NULL,10,1,'2025-09-06 21:11:31','2025-09-06 21:11:31','卡劵'),(11,'福利社',NULL,11,1,'2025-09-06 21:11:31','2025-09-06 21:11:31','福利社');
/*!40000 ALTER TABLE `pr_category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pr_cdk_receipts`
--

DROP TABLE IF EXISTS `pr_cdk_receipts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pr_cdk_receipts` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '回执ID',
  `cdk_id` bigint DEFAULT NULL COMMENT 'CDK ID（可选，代充订单可能没有关联的CDK）',
  `order_id` bigint NOT NULL COMMENT '订单ID',
  `user_id` bigint DEFAULT NULL COMMENT '用户ID',
  `receipt_fields` json DEFAULT NULL COMMENT '回执字段配置',
  `receipt_data` json DEFAULT NULL COMMENT '回执数据',
  `delivery_status` tinyint DEFAULT '0' COMMENT '发货状态: 0-待发货, 1-已发货, 2-发货失败',
  `delivered_by` bigint DEFAULT NULL COMMENT '发货人ID',
  `delivered_at` datetime DEFAULT NULL COMMENT '发货时间',
  `notes` text COLLATE utf8mb4_unicode_ci COMMENT '备注',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `cdk_id` (`cdk_id`),
  KEY `order_id` (`order_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `pr_cdk_receipts_ibfk_2` FOREIGN KEY (`order_id`) REFERENCES `order` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `pr_cdk_receipts_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pr_cdk_receipts`
--

LOCK TABLES `pr_cdk_receipts` WRITE;
/*!40000 ALTER TABLE `pr_cdk_receipts` DISABLE KEYS */;
INSERT INTO `pr_cdk_receipts` VALUES (3,177,47,13,'[{\"name\": \"account\", \"type\": \"text\", \"label\": \"账号\", \"required\": true, \"placeholder\": \"请输入游戏账号\"}, {\"name\": \"password\", \"type\": \"text\", \"label\": \"密码\", \"required\": true, \"placeholder\": \"请输入密码\"}, {\"name\": \"server\", \"type\": \"text\", \"label\": \"服务器\", \"required\": false, \"placeholder\": \"请输入服务器名称\"}]',NULL,0,NULL,NULL,NULL,'2025-09-14 17:26:58',NULL),(4,178,47,13,'[{\"name\": \"account\", \"type\": \"text\", \"label\": \"账号\", \"required\": true}, {\"name\": \"password\", \"type\": \"text\", \"label\": \"密码\", \"required\": true}]','{\"server\": \"美服1区\", \"account\": \"player123\", \"password\": \"abc123456\"}',1,NULL,'2025-09-14 17:26:58',NULL,'2025-09-14 17:26:58',NULL),(5,179,41,12,'[{\"name\": \"account\", \"type\": \"text\", \"label\": \"游戏账号\", \"required\": true, \"placeholder\": \"请输入您的游戏账号\"}, {\"name\": \"password\", \"type\": \"password\", \"label\": \"密码\", \"required\": true, \"placeholder\": \"请输入您的密码\"}, {\"name\": \"server\", \"type\": \"text\", \"label\": \"服务器\", \"required\": false, \"placeholder\": \"请输入服务器名称（选填）\"}, {\"name\": \"remark\", \"type\": \"text\", \"label\": \"备注\", \"required\": false, \"placeholder\": \"其他需要说明的信息（选填）\"}]','{\"remark\": \"请尽快处理，这是正确的账号信息\", \"server\": \"欧洲服务器\", \"account\": \"TestAccount2024\", \"password\": \"TestPassword2024!\"}',0,NULL,NULL,'{\"modificationRequest\":{\"reason\":\"账号密码填写错误，需要更新为正确的信息\",\"newData\":{\"account\":\"TestAccount2024\",\"password\":\"TestPassword2024!\",\"server\":\"欧洲服务器\",\"remark\":\"请尽快处理，这是正确的账号信息\"},\"requestedAt\":\"2025-09-14T14:01:25.335Z\",\"status\":\"approved\",\"approvedAt\":\"2025-09-14T14:02:33.643Z\"}}','2025-09-14 19:03:57','2025-09-14 14:02:33'),(6,179,52,12,'[{\"name\": \"account\", \"type\": \"text\", \"label\": \"游戏账号\", \"required\": true, \"placeholder\": \"请输入您的游戏账号\"}, {\"name\": \"password\", \"type\": \"password\", \"label\": \"密码\", \"required\": true, \"placeholder\": \"请输入您的密码\"}, {\"name\": \"server\", \"type\": \"text\", \"label\": \"服务器\", \"required\": false, \"placeholder\": \"请输入服务器名称（选填）\"}, {\"name\": \"remark\", \"type\": \"text\", \"label\": \"备注\", \"required\": false, \"placeholder\": \"其他需要说明的信息（选填）\"}]',NULL,0,NULL,NULL,NULL,'2025-09-14 16:07:03','2025-09-14 16:07:03'),(8,NULL,57,12,'[{\"key\": \"gameAccount\", \"type\": \"text\", \"label\": \"游戏账号\", \"required\": true, \"placeholder\": \"请输入游戏账号\"}, {\"key\": \"gamePassword\", \"type\": \"password\", \"label\": \"游戏密码\", \"required\": true, \"placeholder\": \"请输入游戏密码\"}, {\"key\": \"contact\", \"type\": \"text\", \"label\": \"联系方式\", \"required\": true, \"placeholder\": \"请输入手机号或邮箱\"}, {\"key\": \"remark\", \"type\": \"textarea\", \"label\": \"备注信息\", \"required\": false, \"placeholder\": \"请输入备注信息（选填）\"}]','{\"remark\": \"测试提交\", \"contact\": \"cuidong111@gmail.com\", \"gameAccount\": \"testAccount123\", \"gamePassword\": \"password123\"}',0,NULL,NULL,NULL,'2025-09-15 00:43:11','2025-09-15 08:47:03'),(11,NULL,1,1,'[{\"key\": \"gameAccount\", \"type\": \"text\", \"label\": \"游戏账号\", \"required\": true, \"placeholder\": \"请输入游戏账号\"}, {\"key\": \"gamePassword\", \"type\": \"password\", \"label\": \"游戏密码\", \"required\": true, \"placeholder\": \"请输入游戏密码\"}, {\"key\": \"contact\", \"type\": \"text\", \"label\": \"联系方式\", \"required\": true, \"placeholder\": \"请输入手机号或邮箱\"}, {\"key\": \"remark\", \"type\": \"textarea\", \"label\": \"备注信息\", \"required\": false, \"placeholder\": \"请输入备注信息（选填）\"}]',NULL,0,NULL,NULL,NULL,'2025-09-15 01:02:29','2025-09-15 01:02:29'),(12,NULL,2,NULL,'[{\"key\": \"gameAccount\", \"type\": \"text\", \"label\": \"游戏账号\", \"required\": true, \"placeholder\": \"请输入游戏账号\"}, {\"key\": \"gamePassword\", \"type\": \"password\", \"label\": \"游戏密码\", \"required\": true, \"placeholder\": \"请输入游戏密码\"}, {\"key\": \"contact\", \"type\": \"text\", \"label\": \"联系方式\", \"required\": true, \"placeholder\": \"请输入手机号或邮箱\"}, {\"key\": \"remark\", \"type\": \"textarea\", \"label\": \"备注信息\", \"required\": false, \"placeholder\": \"请输入备注信息（选填）\"}]',NULL,0,NULL,NULL,NULL,'2025-09-15 01:02:29','2025-09-15 01:02:29'),(13,NULL,2,NULL,'[{\"key\": \"gameAccount\", \"type\": \"text\", \"label\": \"游戏账号\", \"required\": true, \"placeholder\": \"请输入游戏账号\"}, {\"key\": \"gamePassword\", \"type\": \"password\", \"label\": \"游戏密码\", \"required\": true, \"placeholder\": \"请输入游戏密码\"}, {\"key\": \"contact\", \"type\": \"text\", \"label\": \"联系方式\", \"required\": true, \"placeholder\": \"请输入手机号或邮箱\"}, {\"key\": \"remark\", \"type\": \"textarea\", \"label\": \"备注信息\", \"required\": false, \"placeholder\": \"请输入备注信息（选填）\"}]',NULL,0,NULL,NULL,NULL,'2025-09-15 01:02:29','2025-09-15 01:02:29'),(14,NULL,55,12,'[{\"key\": \"gameAccount\", \"type\": \"text\", \"label\": \"游戏账号\", \"required\": true, \"placeholder\": \"请输入游戏账号\"}, {\"key\": \"gamePassword\", \"type\": \"password\", \"label\": \"游戏密码\", \"required\": true, \"placeholder\": \"请输入游戏密码\"}, {\"key\": \"contact\", \"type\": \"text\", \"label\": \"联系方式\", \"required\": true, \"placeholder\": \"请输入手机号或邮箱\"}, {\"key\": \"remark\", \"type\": \"textarea\", \"label\": \"备注信息\", \"required\": false, \"placeholder\": \"请输入备注信息（选填）\"}]','{\"remark\": \"\", \"contact\": \"789\", \"gameAccount\": \"123\", \"gamePassword\": \"456\"}',0,NULL,NULL,NULL,'2025-09-15 01:02:29','2025-09-15 01:04:10'),(15,NULL,59,12,'[{\"key\": \"gameAccount\", \"type\": \"text\", \"label\": \"游戏账号\", \"required\": true, \"placeholder\": \"请输入游戏账号\"}, {\"key\": \"gamePassword\", \"type\": \"password\", \"label\": \"游戏密码\", \"required\": true, \"placeholder\": \"请输入游戏密码\"}, {\"key\": \"contact\", \"type\": \"text\", \"label\": \"联系方式\", \"required\": true, \"placeholder\": \"请输入手机号或邮箱\"}, {\"key\": \"remark\", \"type\": \"textarea\", \"label\": \"备注信息\", \"required\": false, \"placeholder\": \"请输入备注信息（选填）\"}]','{\"remark\": \"\", \"contact\": \"123\", \"gameAccount\": \"123456\", \"gamePassword\": \"123\"}',0,NULL,NULL,NULL,'2025-09-15 01:48:43','2025-09-15 01:49:02');
/*!40000 ALTER TABLE `pr_cdk_receipts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pr_goods`
--

DROP TABLE IF EXISTS `pr_goods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pr_goods` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `description` text COMMENT '商品描述',
  `price` decimal(10,2) NOT NULL COMMENT '价格',
  `original_price` decimal(10,2) DEFAULT NULL COMMENT '原价',
  `status` tinyint DEFAULT '1' COMMENT '状态 0:下架 1:上架',
  `stock` int DEFAULT '999999' COMMENT '库存',
  `title` varchar(255) NOT NULL COMMENT '商品标题',
  `product_type` varchar(20) DEFAULT 'CDK' COMMENT '商品类型：CDK-虚拟激活码, PHYSICAL-实物商品',
  `cdk_type` varchar(50) DEFAULT NULL COMMENT 'CDK类型：netflix, disney, appletv, steam, coupon等',
  `delivery_mode` varchar(20) DEFAULT 'auto' COMMENT '发货方式：auto-自动发货, manual-手动发货',
  `auto_delivery_limit` int DEFAULT '1' COMMENT '自动发货数量限制（每次订单最多自动发货数量）',
  `duration` varchar(50) DEFAULT NULL COMMENT '时长：1个月、3个月、12个月等',
  `attributes` json DEFAULT NULL COMMENT '商品属性JSON',
  `sort_order` int DEFAULT '0' COMMENT '排序',
  `category_id` bigint DEFAULT NULL COMMENT '分类ID',
  `cover_image` varchar(500) DEFAULT NULL COMMENT '商品封面图片',
  `spec` varchar(255) DEFAULT NULL COMMENT '商品规格',
  `member_price` decimal(10,2) DEFAULT NULL COMMENT '会员价',
  `member_level` int DEFAULT NULL COMMENT '会员等级',
  `monthly_sales` int DEFAULT '0' COMMENT '月销量',
  `rating` decimal(3,2) DEFAULT NULL COMMENT '评分',
  `review_count` int DEFAULT '0' COMMENT '评论数',
  `sku_info` json DEFAULT NULL COMMENT 'SKU信息',
  `specifications` json DEFAULT NULL COMMENT '商品规格JSON',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `goods_code` varchar(50) DEFAULT NULL COMMENT '商品编码',
  `sales` int DEFAULT '0' COMMENT '销量',
  `tags` varchar(255) DEFAULT NULL COMMENT '标签',
  `keywords` varchar(255) DEFAULT NULL COMMENT '关键词',
  `email_enabled` tinyint(1) DEFAULT '0' COMMENT '是否启用邮件',
  `email_subject` varchar(255) DEFAULT NULL COMMENT '邮件主题',
  `email_template` text COMMENT '邮件模板',
  `delivery_requires_receipt` tinyint(1) DEFAULT '0' COMMENT '是否需要回执(代充商品)',
  `receipt_template` json DEFAULT NULL COMMENT '回执模板配置',
  `receipt_fields` text,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pr_goods`
--

LOCK TABLES `pr_goods` WRITE;
/*!40000 ALTER TABLE `pr_goods` DISABLE KEYS */;
INSERT INTO `pr_goods` VALUES (1,'Netflix高级会员账号，支持4K超高清，同时4设备观看，全球解锁',29.99,488.00,1,100,'Netflix 高级账号 12个月','CDK','netflix','auto',1,NULL,NULL,0,3,'/images/xiangqingzhutu1.png',NULL,269.10,0,856,5.00,0,NULL,NULL,'2025-09-02 14:05:37','2025-09-14 18:52:54','PROD_1',0,'','Netflix 高级账号 12个月',1,NULL,NULL,1,NULL,NULL),(2,'Disney+会员账号，畅享迪士尼、漫威、星战等精彩内容',168.00,258.00,1,50,'Disney+ 会员 6个月','CDK','disney','auto',1,NULL,NULL,0,3,'/images/xiangqingzhutu1.png',NULL,179.10,0,423,5.00,0,NULL,NULL,'2025-09-02 14:05:37','2025-09-13 17:17:15','PROD_2',0,NULL,NULL,1,NULL,NULL,0,NULL,NULL),(3,'Apple TV+会员，独家原创剧集，支持4K HDR',98.00,158.00,1,30,'Apple TV+ 会员 3个月','CDK','steam','auto',1,NULL,NULL,0,3,'/images/xiangqingzhutu1.png',NULL,619.20,0,287,5.00,0,NULL,NULL,'2025-09-02 14:05:37','2025-09-13 17:17:15','PROD_3',0,NULL,NULL,1,NULL,NULL,0,NULL,NULL),(4,'Steam平台充值卡，即买即用，全球通用',350.00,400.00,1,40,'Steam充值卡 0','CDK','spotify','auto',1,NULL,NULL,0,8,'/images/xiangqingzhutu1.png',NULL,179.10,0,165,5.00,0,NULL,NULL,'2025-09-02 14:05:37','2025-09-13 17:17:15','PROD_4',0,NULL,NULL,1,NULL,NULL,0,NULL,NULL),(5,'迪士尼流媒体平台会员3个月套餐',85.00,NULL,1,999999,'Disney+ 会员 3个月','CDK',NULL,'auto',1,NULL,NULL,0,3,NULL,NULL,NULL,0,0,5.00,0,NULL,NULL,'2025-09-02 14:05:37','2025-09-13 17:16:07','PROD_5',0,NULL,NULL,1,NULL,NULL,0,NULL,NULL),(6,'HBO Max会员3个月，权游等独家内容',108.00,NULL,1,999999,'HBO Max 会员 3个月','CDK',NULL,'auto',1,NULL,NULL,0,3,NULL,NULL,NULL,0,0,5.00,0,NULL,NULL,'2025-09-02 14:05:37','2025-09-13 17:16:07','PROD_6',0,NULL,NULL,1,NULL,NULL,0,NULL,NULL),(7,'Steam平台20美元充值卡',144.00,NULL,1,999999,'Steam充值卡 0','CDK',NULL,'auto',1,NULL,NULL,0,8,'/images/netflix.png',NULL,NULL,0,0,5.00,0,NULL,NULL,'2025-09-02 14:05:37','2025-09-13 17:17:15','PROD_7',0,'','Steam充值卡 0',1,NULL,NULL,0,NULL,NULL),(8,'Claude Pro会员，无限制使用',158.00,NULL,1,999999,'Claude Pro 1个月','CDK',NULL,'auto',1,NULL,NULL,0,3,NULL,NULL,NULL,0,0,5.00,0,NULL,NULL,'2025-09-02 14:05:37','2025-09-13 17:16:07','PROD_8',0,NULL,NULL,1,NULL,NULL,0,NULL,NULL),(10,'',0.03,NULL,1,999999,'测试商品2','CDK',NULL,'auto',1,NULL,NULL,0,3,'http://localhost:3002/uploads/product-1757324757139-270831474.png',NULL,NULL,0,0,5.00,0,'[{\"price\": 0.02, \"skuId\": \"SKU1757589868433_0\", \"stock\": 0, \"status\": 1, \"skuName\": \"1个月\", \"attributes\": {\"duration\": \"1month\"}, \"expireDays\": 30, \"skuDescription\": \"1个月会员\"}, {\"price\": 0.05, \"skuId\": \"SKU1757589868433_1\", \"stock\": 0, \"status\": 1, \"skuName\": \"3个月\", \"attributes\": {\"duration\": \"3month\"}, \"expireDays\": 90, \"skuDescription\": \"3个月会员\"}, {\"price\": 0, \"skuId\": \"SKU1757589868433_2\", \"stock\": 0, \"status\": 0, \"skuName\": \"6个月\", \"attributes\": {\"duration\": \"6month\"}, \"expireDays\": 180, \"skuDescription\": \"6个月会员\"}, {\"price\": 0.09, \"skuId\": \"SKU1757589868433_3\", \"stock\": 0, \"status\": 1, \"skuName\": \"12个月\", \"attributes\": {\"duration\": \"12month\"}, \"expireDays\": 365, \"skuDescription\": \"12个月会员\"}]',NULL,'2025-09-07 23:58:53','2025-09-11 19:24:49','111',0,'','测试商品2',1,NULL,NULL,0,NULL,NULL),(11,'',0.05,NULL,1,999999,'代充服务呀','CDK','manual_recharge','manual',1,NULL,NULL,0,8,'/uploads/product-1757837488887-426876063.png',NULL,NULL,0,0,5.00,0,NULL,NULL,'2025-09-14 12:52:42','2025-09-14 19:03:02','111',0,'','代充服务呀',1,'','',1,NULL,NULL);
/*!40000 ALTER TABLE `pr_goods` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pr_goods_backup`
--

DROP TABLE IF EXISTS `pr_goods_backup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pr_goods_backup` (
  `id` bigint NOT NULL DEFAULT '0' COMMENT '商品ID',
  `category_id` bigint DEFAULT NULL COMMENT '分类ID',
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '商品名称',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '商品描述',
  `product_type` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'CDK' COMMENT '商品类型：CDK-虚拟激活码, PHYSICAL-实物商品',
  `cdk_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'CDK类型：netflix, disney, appletv, steam, coupon等',
  `delivery_mode` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'auto' COMMENT '发货方式：auto-自动发货, manual-手动发货',
  `auto_delivery_limit` int DEFAULT '1' COMMENT '自动发货数量限制（每次订单最多自动发货数量）',
  `duration` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '时长：1个月、3个月、12个月等',
  `price` decimal(10,2) NOT NULL COMMENT '价格',
  `original_price` decimal(10,2) DEFAULT NULL COMMENT '原价',
  `stock` int DEFAULT '999999' COMMENT '库存',
  `sold_count` int DEFAULT '0' COMMENT '销量',
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '商品图片',
  `status` tinyint DEFAULT '1' COMMENT '状态 0:下架 1:上架',
  `sort_order` int DEFAULT '0' COMMENT '排序',
  `attributes` json DEFAULT NULL COMMENT '商品属性JSON',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `goods_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `spec` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `detail` text COLLATE utf8mb4_unicode_ci,
  `keyword` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_hot` tinyint DEFAULT '0',
  `is_recommend` tinyint DEFAULT '0',
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `keywords` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cover_image` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sales` int DEFAULT '0',
  `tags` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order_num` int DEFAULT '0',
  `coupon_state` tinyint DEFAULT '0',
  `add_state` tinyint DEFAULT '1',
  `add_unit` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT '个',
  `add_amount` int DEFAULT '1',
  `member_price` decimal(10,2) DEFAULT NULL,
  `member_level` int DEFAULT '0',
  `monthly_sales` int DEFAULT '0',
  `rating` decimal(3,2) DEFAULT '5.00',
  `review_count` int DEFAULT '0',
  `sku_info` json DEFAULT NULL,
  `specifications` json DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pr_goods_backup`
--

LOCK TABLES `pr_goods_backup` WRITE;
/*!40000 ALTER TABLE `pr_goods_backup` DISABLE KEYS */;
INSERT INTO `pr_goods_backup` VALUES (1,NULL,'Netflix 12个月','Netflix 12个月会员订阅','CDK','netflix','auto',1,NULL,299.00,NULL,100,0,NULL,1,0,NULL,'2025-09-02 05:30:04','2025-09-02 05:30:04','GOODS_1','streaming',NULL,'https://via.placeholder.com/400x300/FF6B6B/FFFFFF?text=Netflix','<h3>Netflix 12个月</h3><p>优质服务，极速发货</p><ul><li>正规渠道</li><li>售后保障</li><li>即买即用</li></ul>',NULL,1,1,'Netflix 12个月',NULL,'https://via.placeholder.com/400x300/FF6B6B/FFFFFF?text=Netflix',0,NULL,0,0,1,'个',1,269.10,0,74,5.00,11,NULL,NULL),(2,NULL,'Disney+ 6个月','Disney+ 6个月会员订阅','CDK','disney','auto',1,NULL,199.00,NULL,50,0,NULL,1,0,NULL,'2025-09-02 05:30:04','2025-09-02 05:30:04','GOODS_2','streaming',NULL,'https://via.placeholder.com/400x300/FF6B6B/FFFFFF?text=Netflix','<h3>Disney+ 6个月</h3><p>优质服务，极速发货</p><ul><li>正规渠道</li><li>售后保障</li><li>即买即用</li></ul>',NULL,1,1,'Disney+ 6个月',NULL,'https://via.placeholder.com/400x300/FF6B6B/FFFFFF?text=Netflix',0,NULL,0,0,1,'个',1,179.10,0,84,5.00,20,NULL,NULL),(3,NULL,'Steam $100充值卡','Steam钱包充值卡 $100','CDK','steam','auto',1,NULL,688.00,NULL,30,0,NULL,1,0,NULL,'2025-09-02 05:30:04','2025-09-02 05:30:04','GOODS_3','streaming',NULL,'https://via.placeholder.com/400x300/FF6B6B/FFFFFF?text=Netflix','<h3>Steam $100充值卡</h3><p>优质服务，极速发货</p><ul><li>正规渠道</li><li>售后保障</li><li>即买即用</li></ul>',NULL,1,1,'Steam $100充值卡',NULL,'https://via.placeholder.com/400x300/FF6B6B/FFFFFF?text=Netflix',0,NULL,0,0,1,'个',1,619.20,0,38,5.00,31,NULL,NULL),(4,NULL,'Spotify 12个月','Spotify Premium 12个月订阅','CDK','spotify','auto',1,NULL,199.00,NULL,40,0,NULL,1,0,NULL,'2025-09-02 05:30:04','2025-09-02 05:30:04','GOODS_4','streaming',NULL,'https://via.placeholder.com/400x300/FF6B6B/FFFFFF?text=Netflix','<h3>Spotify 12个月</h3><p>优质服务，极速发货</p><ul><li>正规渠道</li><li>售后保障</li><li>即买即用</li></ul>',NULL,1,1,'Spotify 12个月',NULL,'https://via.placeholder.com/400x300/FF6B6B/FFFFFF?text=Netflix',0,NULL,0,0,1,'个',1,179.10,0,92,5.00,29,NULL,NULL);
/*!40000 ALTER TABLE `pr_goods_backup` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pr_goods_cdkey`
--

DROP TABLE IF EXISTS `pr_goods_cdkey`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pr_goods_cdkey` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'CDK ID',
  `product_id` bigint NOT NULL COMMENT '商品ID',
  `cdk_code` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'CDK激活码',
  `cdk_type` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'normal' COMMENT 'CDK类型：normal-普通, account-账号类, recharge-充值类, coupon-优惠券',
  `status` tinyint DEFAULT '0' COMMENT '状态 0:未售 1:已售 2:已使用 3:已过期 4:已锁定',
  `order_id` bigint DEFAULT NULL COMMENT '订单ID',
  `user_id` bigint DEFAULT NULL COMMENT '使用者ID',
  `sold_date` datetime DEFAULT NULL COMMENT '售出时间',
  `used_date` datetime DEFAULT NULL COMMENT '使用时间',
  `expire_date` datetime DEFAULT NULL COMMENT '过期时间',
  `account_info` json DEFAULT NULL COMMENT '账号信息（账号类CDK）',
  `extra_data` json DEFAULT NULL COMMENT '额外数据',
  `remark` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '备注',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `goods_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cdkey_status` tinyint DEFAULT '0',
  `is_reusable` tinyint(1) DEFAULT '0' COMMENT '是否可重复使用',
  `max_usage_count` int DEFAULT '1' COMMENT '最大使用次数',
  `current_usage_count` int DEFAULT '0' COMMENT '当前使用次数',
  `usage_expire_date` datetime DEFAULT NULL COMMENT '使用有效期',
  `last_used_date` datetime DEFAULT NULL COMMENT '最后使用时间',
  `cdk_category` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'one_time' COMMENT 'CDK分类: manual_recharge(代充), reusable_stock(可重复使用有库存), one_time(一次性)',
  `receipt_fields` json DEFAULT NULL COMMENT '回执项配置(代充CDK)',
  `receipt_data` json DEFAULT NULL COMMENT '回执数据(代充CDK)',
  `release_days` int DEFAULT '30' COMMENT '释放天数(可重复使用CDK)',
  `product_spec_id` bigint DEFAULT NULL COMMENT '商品规格ID',
  `is_unlimited_stock` tinyint(1) DEFAULT '0' COMMENT '是否无限库存(代充CDK)',
  PRIMARY KEY (`id`),
  UNIQUE KEY `cdk_code` (`cdk_code`),
  KEY `product_id` (`product_id`),
  KEY `idx_cdk_category` (`cdk_category`),
  KEY `idx_product_spec_id` (`product_spec_id`),
  CONSTRAINT `fk_cdk_product_spec` FOREIGN KEY (`product_spec_id`) REFERENCES `pr_product_specifications` (`id`) ON DELETE SET NULL,
  CONSTRAINT `pr_goods_cdkey_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `pr_goods` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=181 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pr_goods_cdkey`
--

LOCK TABLES `pr_goods_cdkey` WRITE;
/*!40000 ALTER TABLE `pr_goods_cdkey` DISABLE KEYS */;
INSERT INTO `pr_goods_cdkey` VALUES (1,1,'NETFLIX-W7HG-2Z0O-E0FA','account',2,NULL,NULL,'2025-08-24 09:25:58','2025-08-28 13:57:44','2026-09-02 05:30:04',NULL,NULL,'测试CDK #1','2025-09-02 05:30:04','2025-09-02 05:30:04','GOODS_1',2,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(2,1,'NETFLIX-JDFH-Q8BN-LWCJ','account',1,NULL,NULL,'2025-08-25 09:22:27',NULL,'2026-09-02 05:30:04',NULL,NULL,'测试CDK #2','2025-09-02 05:30:04','2025-09-02 05:30:04','GOODS_1',1,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(3,1,'NETFLIX-6BUO-ISQW-DWWW','account',1,NULL,NULL,'2025-08-06 13:43:00',NULL,'2026-09-02 05:30:04',NULL,NULL,'测试CDK #3','2025-09-02 05:30:04','2025-09-02 05:30:04','GOODS_1',1,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(4,1,'NETFLIX-6RQM-NTSO-P1OE','account',1,NULL,NULL,'2025-08-08 06:30:28',NULL,'2026-09-02 05:30:04',NULL,NULL,'测试CDK #4','2025-09-02 05:30:04','2025-09-02 05:30:04','GOODS_1',1,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(5,1,'NETFLIX-LUSC-5UPG-VY38','account',2,NULL,NULL,'2025-08-10 12:30:20','2025-08-27 20:14:05','2026-09-02 05:30:04',NULL,NULL,'测试CDK #5','2025-09-02 05:30:04','2025-09-02 05:30:04','GOODS_1',2,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(6,1,'NETFLIX-N661-IWJW-0FOH','account',2,NULL,NULL,'2025-08-26 06:14:41','2025-08-28 12:25:40','2026-09-02 05:30:04',NULL,NULL,'测试CDK #6','2025-09-02 05:30:04','2025-09-02 05:30:04','GOODS_1',2,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(7,1,'NETFLIX-3XAP-1FIQ-1Q39','account',2,NULL,NULL,'2025-08-19 14:45:59','2025-09-01 08:51:11','2026-09-02 05:30:04',NULL,NULL,'测试CDK #7','2025-09-02 05:30:04','2025-09-02 05:30:04','GOODS_1',2,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(8,1,'NETFLIX-W72X-XY18-DSM4','account',1,NULL,NULL,'2025-08-12 06:46:00',NULL,'2026-09-02 05:30:04',NULL,NULL,'测试CDK #8','2025-09-02 05:30:04','2025-09-02 05:30:04','GOODS_1',1,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(9,1,'NETFLIX-194U-OAFH-YOIJ','account',1,NULL,NULL,'2025-08-21 22:48:29',NULL,'2026-09-02 05:30:04',NULL,NULL,'测试CDK #9','2025-09-02 05:30:04','2025-09-02 05:30:04','GOODS_1',1,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(10,1,'NETFLIX-F4JS-NRAK-BDKI','account',1,2,0,'2025-09-13 12:07:11',NULL,'2026-09-02 05:30:04',NULL,NULL,'测试CDK #10','2025-09-02 05:30:04','2025-09-13 12:07:11','GOODS_1',0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(11,1,'NETFLIX-9KMN-Q1G5-1QC4','account',1,NULL,NULL,'2025-08-31 03:46:19',NULL,'2026-09-02 05:30:04',NULL,NULL,'测试CDK #11','2025-09-02 05:30:04','2025-09-02 05:30:04','GOODS_1',1,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(12,1,'NETFLIX-2XLJ-WI9U-GC8M','account',0,NULL,NULL,NULL,NULL,'2026-09-02 05:30:04',NULL,NULL,'测试CDK #12','2025-09-02 05:30:04','2025-09-02 05:30:04','GOODS_1',0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(13,1,'NETFLIX-V7DO-0JA2-3ZXC','account',1,NULL,NULL,'2025-08-15 02:04:18',NULL,'2026-09-02 05:30:04',NULL,NULL,'测试CDK #13','2025-09-02 05:30:04','2025-09-02 05:30:04','GOODS_1',1,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(14,1,'NETFLIX-Z9OO-W62P-NVRQ','account',1,NULL,NULL,'2025-08-07 04:57:54',NULL,'2026-09-02 05:30:04',NULL,NULL,'测试CDK #14','2025-09-02 05:30:04','2025-09-02 05:30:04','GOODS_1',1,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(15,1,'NETFLIX-R5YE-I687-F4U7','account',0,NULL,NULL,NULL,NULL,'2026-09-02 05:30:04',NULL,NULL,'测试CDK #15','2025-09-02 05:30:04','2025-09-02 05:30:04','GOODS_1',0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(16,1,'NETFLIX-3BYW-PUUX-4M18','account',1,NULL,NULL,'2025-08-14 08:09:23',NULL,'2026-09-02 05:30:04',NULL,NULL,'测试CDK #16','2025-09-02 05:30:04','2025-09-02 05:30:04','GOODS_1',1,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(17,1,'NETFLIX-OKPG-ZOB2-R4ZW','account',1,NULL,NULL,'2025-08-05 23:19:34',NULL,'2026-09-02 05:30:04',NULL,NULL,'测试CDK #17','2025-09-02 05:30:04','2025-09-02 05:30:04','GOODS_1',1,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(18,1,'NETFLIX-4X78-T92C-O0HP','account',1,NULL,NULL,'2025-08-31 21:23:49',NULL,'2026-09-02 05:30:04',NULL,NULL,'测试CDK #18','2025-09-02 05:30:04','2025-09-02 05:30:04','GOODS_1',1,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(19,1,'NETFLIX-7FAZ-GXRZ-GS0L','account',1,NULL,NULL,'2025-08-20 03:42:41',NULL,'2026-09-02 05:30:04',NULL,NULL,'测试CDK #19','2025-09-02 05:30:04','2025-09-02 05:30:04','GOODS_1',1,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(20,1,'NETFLIX-TE65-YXNY-HX1V','account',2,NULL,NULL,'2025-08-03 16:05:28','2025-08-29 15:35:36','2026-09-02 05:30:04',NULL,NULL,'测试CDK #20','2025-09-02 05:30:04','2025-09-02 05:30:04','GOODS_1',2,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(21,2,'DISNEY-PQY1-EJMF-CZ1P','account',1,NULL,NULL,'2025-08-12 22:54:42',NULL,'2026-09-02 05:30:04',NULL,NULL,'测试CDK #1','2025-09-02 05:30:04','2025-09-02 05:30:04','GOODS_2',1,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(22,2,'DISNEY-JNKE-NCIY-JV2Q','account',0,NULL,NULL,NULL,NULL,'2026-09-02 05:30:04',NULL,NULL,'测试CDK #2','2025-09-02 05:30:04','2025-09-02 05:30:04','GOODS_2',0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(23,2,'DISNEY-223J-ODN9-1MSP','account',1,NULL,NULL,'2025-08-12 10:52:23',NULL,'2026-09-02 05:30:04',NULL,NULL,'测试CDK #3','2025-09-02 05:30:04','2025-09-02 05:30:04','GOODS_2',1,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(24,2,'DISNEY-NC3J-LAXB-BS0G','account',1,NULL,NULL,'2025-08-22 16:09:08',NULL,'2026-09-02 05:30:04',NULL,NULL,'测试CDK #4','2025-09-02 05:30:04','2025-09-02 05:30:04','GOODS_2',1,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(25,2,'DISNEY-IRCI-VS8A-PNBK','account',2,NULL,NULL,'2025-08-04 14:36:38','2025-08-29 05:26:45','2026-09-02 05:30:04',NULL,NULL,'测试CDK #5','2025-09-02 05:30:04','2025-09-02 05:30:04','GOODS_2',2,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(26,2,'DISNEY-MCQ1-859A-EEHA','account',1,NULL,NULL,'2025-08-06 06:59:57',NULL,'2026-09-02 05:30:04',NULL,NULL,'测试CDK #6','2025-09-02 05:30:04','2025-09-02 05:30:04','GOODS_2',1,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(27,2,'DISNEY-LGJ9-QBHC-TEER','account',1,NULL,NULL,'2025-08-27 05:28:02',NULL,'2026-09-02 05:30:04',NULL,NULL,'测试CDK #7','2025-09-02 05:30:04','2025-09-02 05:30:04','GOODS_2',1,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(28,2,'DISNEY-TT2J-FREA-4ZS8','account',0,NULL,NULL,NULL,NULL,'2026-09-02 05:30:04',NULL,NULL,'测试CDK #8','2025-09-02 05:30:04','2025-09-02 05:30:04','GOODS_2',0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(29,2,'DISNEY-D0UZ-RGS4-32J1','account',0,NULL,NULL,NULL,NULL,'2026-09-02 05:30:04',NULL,NULL,'测试CDK #9','2025-09-02 05:30:04','2025-09-02 05:30:04','GOODS_2',0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(30,2,'DISNEY-GK72-IGZ8-TFLN','account',0,NULL,NULL,NULL,NULL,'2026-09-02 05:30:04',NULL,NULL,'测试CDK #10','2025-09-02 05:30:04','2025-09-02 05:30:04','GOODS_2',0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(31,2,'DISNEY-5XLS-JQER-WLS5','account',1,NULL,NULL,'2025-08-28 22:33:09',NULL,'2026-09-02 05:30:04',NULL,NULL,'测试CDK #11','2025-09-02 05:30:04','2025-09-02 05:30:04','GOODS_2',1,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(32,2,'DISNEY-H3TB-5Y0T-7J0Z','account',2,NULL,NULL,'2025-08-28 16:04:05','2025-09-01 12:21:12','2026-09-02 05:30:04',NULL,NULL,'测试CDK #12','2025-09-02 05:30:04','2025-09-02 05:30:04','GOODS_2',2,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(33,2,'DISNEY-KY7X-2U1N-ZJ8C','account',1,NULL,NULL,'2025-08-16 08:38:36',NULL,'2026-09-02 05:30:04',NULL,NULL,'测试CDK #13','2025-09-02 05:30:04','2025-09-02 05:30:04','GOODS_2',1,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(34,2,'DISNEY-X7PA-1ZD0-AE48','account',1,NULL,NULL,'2025-08-20 16:37:41',NULL,'2026-09-02 05:30:04',NULL,NULL,'测试CDK #14','2025-09-02 05:30:04','2025-09-02 05:30:04','GOODS_2',1,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(35,2,'DISNEY-7OSS-4DTI-987P','account',0,NULL,NULL,NULL,NULL,'2026-09-02 05:30:04',NULL,NULL,'测试CDK #15','2025-09-02 05:30:04','2025-09-02 05:30:04','GOODS_2',0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(36,3,'STEAM-2WAE-STZC-GUFL','recharge',0,NULL,NULL,NULL,NULL,'2026-09-02 05:30:04',NULL,NULL,'测试CDK #1','2025-09-02 05:30:04','2025-09-02 05:30:04','GOODS_3',0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(37,3,'STEAM-E4TV-DZBR-ZKFI','recharge',1,NULL,NULL,'2025-08-29 10:20:20',NULL,'2026-09-02 05:30:04',NULL,NULL,'测试CDK #2','2025-09-02 05:30:04','2025-09-02 05:30:04','GOODS_3',1,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(38,3,'STEAM-C2M3-A97W-C1IC','recharge',2,NULL,NULL,'2025-08-19 09:16:27','2025-08-31 15:41:46','2026-09-02 05:30:04',NULL,NULL,'测试CDK #3','2025-09-02 05:30:04','2025-09-02 05:30:04','GOODS_3',2,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(39,3,'STEAM-EVEI-HYAE-TC8P','recharge',0,NULL,NULL,NULL,NULL,'2026-09-02 05:30:04',NULL,NULL,'测试CDK #4','2025-09-02 05:30:04','2025-09-02 05:30:04','GOODS_3',0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(40,3,'STEAM-YJVR-EHV3-OYX5','recharge',0,NULL,NULL,NULL,NULL,'2026-09-02 05:30:04',NULL,NULL,'测试CDK #5','2025-09-02 05:30:04','2025-09-02 05:30:04','GOODS_3',0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(41,3,'STEAM-K5UN-TX0R-EFC7','recharge',1,NULL,NULL,'2025-08-10 02:39:37',NULL,'2026-09-02 05:30:04',NULL,NULL,'测试CDK #6','2025-09-02 05:30:04','2025-09-02 05:30:04','GOODS_3',1,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(42,3,'STEAM-MW0H-9Q1B-GHBG','recharge',2,NULL,NULL,'2025-08-08 09:31:30','2025-09-01 00:58:46','2026-09-02 05:30:04',NULL,NULL,'测试CDK #7','2025-09-02 05:30:04','2025-09-02 05:30:04','GOODS_3',2,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(43,3,'STEAM-GKLV-LAQW-UC9X','recharge',1,NULL,NULL,'2025-08-06 18:36:58',NULL,'2026-09-02 05:30:04',NULL,NULL,'测试CDK #8','2025-09-02 05:30:04','2025-09-02 05:30:04','GOODS_3',1,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(44,3,'STEAM-0HEW-UH8V-AYP6','recharge',1,NULL,NULL,'2025-08-09 09:27:02',NULL,'2026-09-02 05:30:04',NULL,NULL,'测试CDK #9','2025-09-02 05:30:04','2025-09-02 05:30:04','GOODS_3',1,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(45,3,'STEAM-8CQN-FRF5-SUQI','recharge',2,NULL,NULL,'2025-09-01 02:55:50','2025-08-26 05:55:01','2026-09-02 05:30:04',NULL,NULL,'测试CDK #10','2025-09-02 05:30:04','2025-09-02 05:30:04','GOODS_3',2,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(46,4,'SPOTIFY-G2MZ-V8X3-035B','account',0,NULL,NULL,NULL,NULL,'2026-09-02 05:30:04',NULL,NULL,'测试CDK #1','2025-09-02 05:30:04','2025-09-02 05:30:04','GOODS_4',0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(47,4,'SPOTIFY-HF5D-RPKC-12L0','account',1,NULL,NULL,'2025-08-13 00:18:16',NULL,'2026-09-02 05:30:04',NULL,NULL,'测试CDK #2','2025-09-02 05:30:04','2025-09-02 05:30:04','GOODS_4',1,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(48,4,'SPOTIFY-V2SP-Z2MG-BVAQ','account',1,NULL,NULL,'2025-08-21 05:36:12',NULL,'2026-09-02 05:30:04',NULL,NULL,'测试CDK #3','2025-09-02 05:30:04','2025-09-02 05:30:04','GOODS_4',1,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(49,4,'SPOTIFY-VM8T-8RRJ-Y6N6','account',2,NULL,NULL,'2025-08-21 15:51:08','2025-08-27 03:57:07','2026-09-02 05:30:04',NULL,NULL,'测试CDK #4','2025-09-02 05:30:04','2025-09-02 05:30:04','GOODS_4',2,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(50,4,'SPOTIFY-1QQG-UWWJ-6YK3','account',1,NULL,NULL,'2025-08-18 08:18:01',NULL,'2026-09-02 05:30:04',NULL,NULL,'测试CDK #5','2025-09-02 05:30:04','2025-09-02 05:30:04','GOODS_4',1,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(51,4,'SPOTIFY-QHCU-KRYU-5MLF','account',2,NULL,NULL,'2025-08-15 09:08:57','2025-08-26 10:46:58','2026-09-02 05:30:04',NULL,NULL,'测试CDK #6','2025-09-02 05:30:04','2025-09-02 05:30:04','GOODS_4',2,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(52,4,'SPOTIFY-HVWX-DIV7-JB7Q','account',0,NULL,NULL,NULL,NULL,'2026-09-02 05:30:04',NULL,NULL,'测试CDK #7','2025-09-02 05:30:04','2025-09-02 05:30:04','GOODS_4',0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(53,4,'SPOTIFY-LX9S-F0A9-522N','account',0,NULL,NULL,NULL,NULL,'2026-09-02 05:30:04',NULL,NULL,'测试CDK #8','2025-09-02 05:30:04','2025-09-02 05:30:04','GOODS_4',0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(54,4,'SPOTIFY-YQ6K-HM29-V140','account',1,NULL,NULL,'2025-08-09 16:38:04',NULL,'2026-09-02 05:30:04',NULL,NULL,'测试CDK #9','2025-09-02 05:30:04','2025-09-02 05:30:04','GOODS_4',1,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(55,4,'SPOTIFY-N0P4-5I1X-6FGB','account',2,NULL,NULL,'2025-08-12 18:18:24','2025-08-27 20:21:45','2026-09-02 05:30:04',NULL,NULL,'测试CDK #10','2025-09-02 05:30:04','2025-09-02 05:30:04','GOODS_4',2,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(56,4,'SPOTIFY-S2RF-39VD-EH0V','account',2,NULL,NULL,'2025-08-13 08:16:46','2025-08-28 08:36:34','2026-09-02 05:30:04',NULL,NULL,'测试CDK #11','2025-09-02 05:30:04','2025-09-02 05:30:04','GOODS_4',2,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(57,4,'SPOTIFY-MOGB-CLCQ-VWSD','account',0,NULL,NULL,NULL,NULL,'2026-09-02 05:30:04',NULL,NULL,'测试CDK #12','2025-09-02 05:30:04','2025-09-02 05:30:04','GOODS_4',0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(58,1,'TEST-D3JM-YCZR-NQIC-UWZI','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 08:36:22','2025-09-13 08:36:22',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(59,1,'TEST-54BG-BC6J-4VFP-PMK0','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 08:36:22','2025-09-13 08:36:22',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(60,1,'TEST-11SJ-P5KO-ZNXH-5JDJ','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 08:36:22','2025-09-13 08:36:22',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(61,1,'TEST-OOMV-NAIL-7E10-MO0D','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 08:36:22','2025-09-13 08:36:22',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(62,1,'TEST-PX8P-8S20-6M4U-513L','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 08:36:22','2025-09-13 08:36:22',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(63,1,'VIP-YSV7-0035-G81Q-A7L2','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 08:36:33','2025-09-13 08:36:33',NULL,0,1,10,0,'1970-01-01 00:00:00',NULL,'one_time',NULL,NULL,30,NULL,0),(64,1,'VIP-UUOV-1YAH-DU12-XKKP','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 08:36:33','2025-09-13 08:36:33',NULL,0,1,10,0,'1970-01-01 00:00:00',NULL,'one_time',NULL,NULL,30,NULL,0),(65,1,'VIP-64ID-ZET7-WG4E-QUG0','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 08:36:33','2025-09-13 08:36:33',NULL,0,1,10,0,'1970-01-01 00:00:00',NULL,'one_time',NULL,NULL,30,NULL,0),(66,10,'VIDEO1111-3QF4-BKF5-O0Z9-4RTN','normal',1,39,12,'2025-09-13 12:08:20',NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 12:08:20',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(67,10,'VIDEO1111-FX12-CGYT-87BX-OFG2','normal',1,40,12,'2025-09-14 07:37:29',NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-14 07:37:29',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(68,10,'VIDEO1111-C01Q-1WI0-HB0C-0T6L','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(69,10,'VIDEO1111-FG0I-8RSL-WGLB-YNPG','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(70,10,'VIDEO1111-5FRE-U7VS-ABSU-69BT','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(71,10,'VIDEO1111-EWYR-B0YD-CTHM-BZ93','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(72,10,'VIDEO1111-OSKU-FCU6-MJ76-L75Z','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(73,10,'VIDEO1111-B7EY-F014-IMUA-FOAV','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(74,10,'VIDEO1111-R8US-31W6-XQTV-89WP','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(75,10,'VIDEO1111-W5YQ-HD4V-S9FD-JLY2','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(76,10,'VIDEO1111-TZ6W-XFC9-KOJ6-2OIZ','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(77,10,'VIDEO1111-BRB3-F8VQ-N877-W2UW','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(78,10,'VIDEO1111-8SH3-0CXL-HIB6-322N','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(79,10,'VIDEO1111-AI42-Y7L2-YTAO-DIWK','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(80,10,'VIDEO1111-HAIC-KFQA-DLAO-N6U3','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(81,10,'VIDEO1111-52OC-DK33-J5G7-X75T','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(82,10,'VIDEO1111-00EF-G3JR-E5JL-H8S9','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(89,10,'VIDEO1111-QML4-5O0P-3L7O-SNGS','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(90,10,'VIDEO1111-6BK1-1OIC-NX17-3CRM','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(91,10,'VIDEO1111-ARIP-Z3RO-V83J-IHTZ','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(92,10,'VIDEO1111-2ZFF-KAF6-NFIQ-A3QJ','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(93,10,'VIDEO1111-P4EF-2A2L-S85J-OZY4','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(94,10,'VIDEO1111-RG1P-0AFM-111E-L59I','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(95,10,'VIDEO1111-G5VW-4GLK-NK3J-TPCY','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(96,10,'VIDEO1111-RXTQ-S5OS-FZCX-GGVJ','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(97,10,'VIDEO1111-OZFY-1GGY-3COM-LI28','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(98,10,'VIDEO1111-AXNC-OAXG-UCVM-NWHW','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(99,10,'VIDEO1111-ELOD-AM1Z-BO13-VQ36','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(100,10,'VIDEO1111-VEWF-QVV7-OSQP-JA5M','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(101,10,'VIDEO1111-XZ4J-EBZW-OJKP-2NKB','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(102,10,'VIDEO1111-VMQS-9O9J-D7QB-KEQD','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(103,10,'VIDEO1111-QPTU-UIAY-N9ES-5WE3','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(104,10,'VIDEO1111-P3FO-F55A-4IGV-E325','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(105,10,'VIDEO1111-5ETG-FK99-2EUS-P4T7','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(106,10,'VIDEO1111-OZLU-94GK-H3ZN-7JTQ','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(107,10,'VIDEO1111-H1CF-C3NB-T8XE-JS3R','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(108,10,'VIDEO1111-7SYY-1XXY-Q6DA-2XXW','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(109,10,'VIDEO1111-WTCG-0LTL-78B8-V6YA','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(110,10,'VIDEO1111-QX79-HHY4-8MV8-AHDG','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(111,10,'VIDEO1111-10YK-MD47-SS68-YVD9','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(112,10,'VIDEO1111-1IPS-UNZ5-XAPR-2Z1G','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(113,10,'VIDEO1111-JK09-Q5VP-OVXI-1QIQ','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(114,10,'VIDEO1111-CXV5-LR2V-MREK-EMRX','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(115,10,'VIDEO1111-D28R-HGQL-ZX0C-B3RM','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(116,10,'VIDEO1111-P0T4-PXL4-MES6-TUBC','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(117,10,'VIDEO1111-5WJL-9ZMI-X3GZ-IQ18','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(118,10,'VIDEO1111-62NH-G77J-TRNA-CTW4','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(119,10,'VIDEO1111-QR6M-T89O-40WQ-6LDM','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(120,10,'VIDEO1111-0ZY8-WAF4-DNF7-H1NR','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(121,10,'VIDEO1111-8ZNR-9QP3-KCSN-KPCQ','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(122,10,'VIDEO1111-0KEE-O7ZV-TIOW-DV16','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(123,10,'VIDEO1111-2CY6-NQZ3-ARCU-7KU3','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(124,10,'VIDEO1111-KQCM-Z11T-L5GT-TCLO','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(125,10,'VIDEO1111-LMKP-3GMO-7HRJ-QIBF','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(126,10,'VIDEO1111-CGEH-KD9E-BHHO-UQ5D','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(127,10,'VIDEO1111-27PN-HB31-UFDV-AFUZ','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(128,10,'VIDEO1111-0MDT-E4BM-9N8H-85H5','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(129,10,'VIDEO1111-75Q0-ZWFN-K96F-HLCH','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(130,10,'VIDEO1111-F830-U23T-9PT2-8JPO','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(131,10,'VIDEO1111-Q4G7-4TGM-PYEN-4VB2','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(132,10,'VIDEO1111-GU0P-TDJI-24NI-I0U4','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(133,10,'VIDEO1111-38M0-XPH1-49U0-UMJC','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(134,10,'VIDEO1111-DVE8-V1TM-XEKB-QXBY','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(135,10,'VIDEO1111-NN6C-RIXJ-A57F-AQX8','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(136,10,'VIDEO1111-P1MF-NFD7-OMBY-VIPS','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(137,10,'VIDEO1111-FXCO-JR9N-8HF6-CYZ5','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(138,10,'VIDEO1111-JC0T-OHVV-YXZQ-R1GT','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(139,10,'VIDEO1111-ATQO-204J-0X3G-2EGG','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(140,10,'VIDEO1111-4T7G-80PH-DLHH-UWN0','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(141,10,'VIDEO1111-B3YE-KSVU-1OZO-X5KH','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(142,10,'VIDEO1111-T12U-DPB5-TOVY-GSG5','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(143,10,'VIDEO1111-7JC7-N8EW-ACI9-GNS4','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(144,10,'VIDEO1111-FB4O-7XZC-WTWT-PW3Q','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(145,10,'VIDEO1111-FJGL-SQW7-WIIQ-PQ9Q','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(146,10,'VIDEO1111-PC1B-CSKX-W0U5-NKZV','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(147,10,'VIDEO1111-H61B-FS28-7MBU-K8FY','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(148,10,'VIDEO1111-06EI-OFM1-79VV-3UXD','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(149,10,'VIDEO1111-YLD0-YWVL-TS8Q-YTLX','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(150,10,'VIDEO1111-1KTF-4SV9-JA8Y-THSU','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(151,10,'VIDEO1111-64YX-JUBG-86GG-1NJL','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(152,10,'VIDEO1111-V1I0-UFSP-RVPS-Q174','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(153,10,'VIDEO1111-KBMQ-RTYI-AIMT-H9PM','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(154,10,'VIDEO1111-4PKG-59E1-8CXJ-LRZD','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(155,10,'VIDEO1111-GPPF-DBUZ-QI7X-T1LJ','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(156,10,'VIDEO1111-SV6R-YDDL-ZD7G-DFVT','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(157,10,'VIDEO1111-XRH6-WHKB-NN5X-U2FH','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(158,10,'VIDEO1111-ZNQW-SBJ9-5EL6-BHQH','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(159,10,'VIDEO1111-DHYV-Y56M-7PAO-YQ0I','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(160,10,'VIDEO1111-NSJY-FYGY-N066-923G','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(161,10,'VIDEO1111-ZXY9-1451-VESZ-0HXK','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(162,10,'VIDEO1111-XRLN-HPWB-E648-CEH3','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(163,10,'VIDEO1111-TZBZ-5N8P-PMV8-KJ3C','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(164,10,'VIDEO1111-QM2D-W0VX-ML5G-8J43','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(165,10,'VIDEO1111-SDK8-GRQA-UZWT-7BR8','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-13 09:00:03','2025-09-13 09:00:03',NULL,0,0,1,0,NULL,NULL,'one_time',NULL,NULL,30,NULL,0),(170,1,'IMPORT-REUSE-001','normal',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-14 06:11:07','2025-09-14 06:11:07',NULL,0,1,999999,0,NULL,NULL,'reusable_stock',NULL,NULL,7,NULL,0),(177,1,'TEST_CDK_001','recharge',1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-14 17:26:58',NULL,NULL,0,0,1,0,NULL,NULL,'manual_recharge','[{\"name\": \"account\", \"type\": \"text\", \"label\": \"账号\", \"required\": true, \"placeholder\": \"请输入游戏账号\"}, {\"name\": \"password\", \"type\": \"text\", \"label\": \"密码\", \"required\": true, \"placeholder\": \"请输入密码\"}, {\"name\": \"server\", \"type\": \"text\", \"label\": \"服务器\", \"required\": false, \"placeholder\": \"请输入服务器名称\"}]',NULL,30,NULL,0),(178,1,'TEST_CDK_002','recharge',1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-14 17:26:58',NULL,NULL,0,0,1,0,NULL,NULL,'manual_recharge','[{\"name\": \"account\", \"type\": \"text\", \"label\": \"账号\", \"required\": true}, {\"name\": \"password\", \"type\": \"text\", \"label\": \"密码\", \"required\": true}]',NULL,30,NULL,0),(179,11,'RECHARGE_1757847836','recharge',1,52,12,'2025-09-14 16:07:03',NULL,NULL,NULL,NULL,NULL,'2025-09-14 19:03:56','2025-09-14 16:07:03',NULL,0,0,1,0,NULL,NULL,'manual_recharge','[{\"name\": \"account\", \"type\": \"text\", \"label\": \"游戏账号\", \"required\": true, \"placeholder\": \"请输入您的游戏账号\"}, {\"name\": \"password\", \"type\": \"password\", \"label\": \"密码\", \"required\": true, \"placeholder\": \"请输入您的密码\"}, {\"name\": \"server\", \"type\": \"text\", \"label\": \"服务器\", \"required\": false, \"placeholder\": \"请输入服务器名称（选填）\"}, {\"name\": \"remark\", \"type\": \"text\", \"label\": \"备注\", \"required\": false, \"placeholder\": \"其他需要说明的信息（选填）\"}]',NULL,30,NULL,0);
/*!40000 ALTER TABLE `pr_goods_cdkey` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pr_product_skus`
--

DROP TABLE IF EXISTS `pr_product_skus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pr_product_skus` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `product_id` bigint NOT NULL,
  `sku_id` varchar(100) NOT NULL,
  `sku_name` varchar(200) NOT NULL,
  `attributes` json DEFAULT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `stock` int NOT NULL DEFAULT '0',
  `expire_days` int DEFAULT NULL,
  `sku_description` text,
  `license_count` int DEFAULT '1',
  `status` tinyint DEFAULT '1',
  `sales` int DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_sku_id` (`sku_id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pr_product_skus`
--

LOCK TABLES `pr_product_skus` WRITE;
/*!40000 ALTER TABLE `pr_product_skus` DISABLE KEYS */;
INSERT INTO `pr_product_skus` VALUES (12,2,'DP-1M','Disney+ 月度会员',NULL,39.99,100,30,'高清画质，支持4台设备',1,1,0,'2025-09-11 20:00:54','2025-09-11 20:00:54'),(13,2,'DP-3M','Disney+ 季度会员',NULL,99.99,100,90,'高清画质，3个月优惠套餐',1,1,0,'2025-09-11 20:00:54','2025-09-11 20:00:54'),(14,2,'DP-6M','Disney+ 半年会员',NULL,189.99,50,180,'高清画质，半年特惠',1,1,0,'2025-09-11 20:00:54','2025-09-11 20:00:54'),(15,3,'APTV-1M','Apple TV+ 月度会员',NULL,29.99,100,30,'4K HDR画质，家庭共享',1,1,0,'2025-09-11 20:00:54','2025-09-11 20:00:54'),(16,3,'APTV-3M','Apple TV+ 季度会员',NULL,79.99,100,90,'4K HDR画质，季度优惠',1,1,0,'2025-09-11 20:00:54','2025-09-11 20:00:54'),(23,1,'NF-BASIC-1M','基础版 - 1个月','{\"套餐类型\": \"基础版\", \"订阅时长\": \"月度\"}',29.99,99,30,'支持1台设备同时观看，480P标清画质',1,1,1,'2025-09-12 02:04:03','2025-09-15 07:42:23'),(24,1,'NF-BASIC-3M','基础版 - 3个月','{\"套餐类型\": \"基础版\", \"订阅时长\": \"季度\"}',79.99,100,90,'支持1台设备同时观看，480P标清画质，季度优惠15%',1,1,0,'2025-09-12 02:04:03','2025-09-12 02:04:03'),(25,1,'NF-BASIC-12M','基础版 - 12个月','{\"套餐类型\": \"基础版\", \"订阅时长\": \"年度\"}',299.99,100,365,'支持1台设备同时观看，480P标清画质，年付最划算省25%',1,1,0,'2025-09-12 02:04:03','2025-09-12 02:04:03'),(26,1,'NF-STD-1M','标准版 - 1个月','{\"套餐类型\": \"标准版\", \"订阅时长\": \"月度\"}',49.99,50,30,'支持2台设备同时观看，1080P全高清画质',2,1,0,'2025-09-12 02:04:03','2025-09-12 02:04:03'),(27,1,'NF-STD-3M','标准版 - 3个月','{\"套餐类型\": \"标准版\", \"订阅时长\": \"季度\"}',139.99,50,90,'支持2台设备同时观看，1080P全高清画质，季度优惠10%',2,0,0,'2025-09-12 02:04:03','2025-09-12 02:04:03'),(28,1,'NF-STD-12M','标准版 - 12个月','{\"套餐类型\": \"标准版\", \"订阅时长\": \"年度\"}',499.99,50,365,'支持2台设备同时观看，1080P全高清画质，年付最划算省20%',2,0,0,'2025-09-12 02:04:03','2025-09-12 02:04:03'),(29,1,'NF-PREM-1M','高级版 - 月度','{\"套餐类型\": \"高级版\", \"订阅时长\": \"月度\"}',69.99,30,30,'支持4台设备同时观看，4K超高清+HDR画质',4,1,0,'2025-09-12 02:04:03','2025-09-12 02:04:03'),(30,1,'NF-PREM-12M','高级版 - 年度','{\"套餐类型\": \"高级版\", \"订阅时长\": \"年度\"}',699.99,20,365,'支持4台设备同时观看，4K超高清+HDR画质，年付最划算省20%',4,1,0,'2025-09-12 02:04:03','2025-09-12 02:04:03'),(31,4,'STEAM-50','Steam充值卡 50元',NULL,50.00,100,NULL,'可充值到Steam钱包',1,1,0,'2025-09-12 02:18:49','2025-09-12 02:18:49'),(32,4,'STEAM-100','Steam充值卡 100元',NULL,100.00,100,NULL,'可充值到Steam钱包',1,1,0,'2025-09-12 02:18:49','2025-09-12 02:18:49'),(33,4,'STEAM-200','Steam充值卡 200元',NULL,200.00,50,NULL,'可充值到Steam钱包',1,1,0,'2025-09-12 02:18:49','2025-09-12 02:18:49'),(34,5,'DP2-3M','Disney+ 3个月套餐',NULL,89.99,100,90,'支持4K画质，最多4台设备',1,1,0,'2025-09-12 02:18:49','2025-09-12 02:18:49'),(35,5,'DP2-3M-FAM','Disney+ 3个月家庭版',NULL,119.99,50,90,'支持4K画质，最多6台设备，适合全家使用',1,1,0,'2025-09-12 02:18:49','2025-09-12 02:18:49'),(36,6,'HBO-1M','HBO Max 月度会员',NULL,49.99,100,30,'高清画质，支持3台设备',1,1,0,'2025-09-12 02:19:52','2025-09-12 02:19:52'),(37,6,'HBO-3M','HBO Max 季度会员',NULL,129.99,50,90,'高清画质，3个月优惠套餐',1,1,0,'2025-09-12 02:19:52','2025-09-12 02:19:52'),(40,8,'CLAUDE-1M','Claude Pro 月度订阅',NULL,139.99,50,30,'Claude Pro AI助手月度订阅',1,1,0,'2025-09-12 02:19:52','2025-09-12 02:19:52'),(41,8,'CLAUDE-3M','Claude Pro 季度订阅',NULL,399.99,30,90,'Claude Pro AI助手季度优惠',1,1,0,'2025-09-12 02:19:52','2025-09-12 02:19:52'),(56,10,'SKU1757591686653_0','1个月','{\"duration\": \"1month\"}',0.02,0,30,'1个月会员',1,1,2,'2025-09-13 16:02:25','2025-09-14 15:37:10'),(57,10,'SKU1757591686653_1','3个月','{\"duration\": \"3month\"}',0.00,0,90,'3个月会员',1,0,0,'2025-09-13 16:02:25','2025-09-13 16:02:25'),(58,10,'SKU1757591686653_2','6个月','{\"duration\": \"6month\"}',0.00,0,180,'6个月会员',1,0,0,'2025-09-13 16:02:25','2025-09-13 16:02:25'),(59,10,'SKU1757591686653_3','12个月','{\"duration\": \"12month\"}',0.03,0,365,'12个月会员',1,1,0,'2025-09-13 16:02:25','2025-09-13 16:02:25');
/*!40000 ALTER TABLE `pr_product_skus` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pr_product_specifications`
--

DROP TABLE IF EXISTS `pr_product_specifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pr_product_specifications` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `product_id` bigint NOT NULL,
  `specifications` json DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_product_id` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pr_product_specifications`
--

LOCK TABLES `pr_product_specifications` WRITE;
/*!40000 ALTER TABLE `pr_product_specifications` DISABLE KEYS */;
INSERT INTO `pr_product_specifications` VALUES (3,2,'[{\"name\": \"套餐类型\", \"values\": [\"月度\", \"季度\", \"半年\"]}]','2025-09-11 20:00:54','2025-09-11 20:00:54'),(4,3,'[{\"name\": \"套餐类型\", \"values\": [\"月度\", \"季度\"]}]','2025-09-11 20:00:54','2025-09-11 20:00:54'),(6,1,'[{\"name\": \"套餐类型\", \"values\": [\"基础版\", \"标准版\", \"高级版\"]}, {\"name\": \"订阅时长\", \"values\": [\"月度\", \"季度\", \"年度\"]}]','2025-09-12 02:04:03','2025-09-12 02:04:03'),(10,10,'[{\"name\": \"duration\", \"label\": \"会员时长\", \"values\": [{\"label\": \"1个月\", \"value\": \"1month\"}, {\"label\": \"3个月\", \"value\": \"3month\"}, {\"label\": \"6个月\", \"value\": \"6month\"}, {\"label\": \"12个月\", \"value\": \"12month\"}], \"newValue\": \"\", \"addingValue\": false}]','2025-09-13 16:02:25','2025-09-13 16:02:25');
/*!40000 ALTER TABLE `pr_product_specifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_media`
--

DROP TABLE IF EXISTS `product_media`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_media` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '媒体ID',
  `product_id` bigint NOT NULL COMMENT '商品ID',
  `media_type` enum('image','video') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '媒体类型：image-图片, video-视频',
  `media_url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '媒体URL地址',
  `thumbnail_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '缩略图URL（视频使用）',
  `title` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '媒体标题/描述',
  `alt` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '替代文本（SEO优化）',
  `sort_order` int DEFAULT '0' COMMENT '排序顺序',
  `is_primary` tinyint(1) DEFAULT '0' COMMENT '是否为主图/主视频',
  `source` enum('upload','unsplash','pexels','pixabay','external') COLLATE utf8mb4_unicode_ci DEFAULT 'upload' COMMENT '媒体来源',
  `license` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '许可证信息',
  `attribution` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '版权归属信息',
  `metadata` json DEFAULT NULL COMMENT '元数据（尺寸、格式、大小等）',
  `status` tinyint DEFAULT '1' COMMENT '状态：0-禁用, 1-启用',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `product_media_product_id` (`product_id`),
  KEY `product_media_media_type` (`media_type`),
  KEY `product_media_is_primary` (`is_primary`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_media`
--

LOCK TABLES `product_media` WRITE;
/*!40000 ALTER TABLE `product_media` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_media` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `questions`
--

DROP TABLE IF EXISTS `questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `questions` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `categoryName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `question` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `answer` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `keywords` json DEFAULT NULL,
  `views` int DEFAULT '0',
  `helpful` int DEFAULT '0',
  `notHelpful` int DEFAULT '0',
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `isTop` tinyint(1) DEFAULT '0',
  `isHot` tinyint(1) DEFAULT '0',
  `order` int DEFAULT '0',
  `createdBy` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `questions`
--

LOCK TABLES `questions` WRITE;
/*!40000 ALTER TABLE `questions` DISABLE KEYS */;
INSERT INTO `questions` VALUES ('08883217-f52a-425d-a323-f74a70d005df','如何修改个人信息？','account','账户相关','我想修改我的个人信息，包括手机号、邮箱等，该如何操作？','修改个人信息步骤：\n\n1. 登录账户后进入个人中心\n2. 点击编辑资料按钮\n3. 可修改的信息包括：\n   • 昵称\n   • 头像\n   • 邮箱地址\n   • 手机号码\n   • 收货地址\n\n重要提示：\n- 修改手机号需要原手机验证\n- 修改邮箱需要邮箱验证\n- 部分信息修改后需要重新登录','[\"个人信息\", \"修改\", \"资料\", \"手机\", \"邮箱\"]',0,0,0,'active',0,0,4,NULL,'2025-09-14 12:42:36','2025-09-14 12:42:36'),('1d17ce06-fd0b-428f-839e-c1e91ab9d6a4','账户被锁定怎么办？','account','账户相关','我的账户被锁定了，无法登录，应该怎么处理？','账户被锁定的解决方法：\n\n1. 最常见原因是密码输入错误次数过多\n   - 等待30分钟后重试\n   - 或点击忘记密码重置\n\n2. 如果是安全原因锁定\n   - 联系客服验证身份\n   - 提供注册手机号和邮箱\n   - 客服会在核实后解锁\n\n3. 预防措施\n   - 设置容易记住的密码\n   - 开启二次验证\n   - 定期更新密码','[\"账户\", \"锁定\", \"登录\", \"密码\"]',0,0,0,'active',1,0,3,NULL,'2025-09-14 12:42:17','2025-09-14 12:42:17'),('4271f476-8200-4198-8e71-8aa72e0323a9','如何充值到账户？','recharge','充值相关','请问如何给我的账户充值？','您可以通过以下方式充值：\n\n步骤1：登录您的账户\n步骤2：进入充值页面\n步骤3：选择充值金额\n步骤4：选择支付方式（支付宝、微信、币安）\n步骤5：完成支付\n\n充值一般会在1-3分钟内到账，如有问题请联系客服。','[\"充值\", \"支付\", \"到账\"]',0,0,0,'active',1,1,1,NULL,'2025-09-14 12:41:41','2025-09-14 12:53:34');
/*!40000 ALTER TABLE `questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_cart`
--

DROP TABLE IF EXISTS `user_cart`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_cart` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `goods_id` bigint NOT NULL COMMENT '商品ID',
  `quantity` int DEFAULT '1' COMMENT '数量',
  `spec` varchar(100) DEFAULT '' COMMENT '规格',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_goods_spec` (`user_id`,`goods_id`,`spec`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_goods_id` (`goods_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='购物车表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_cart`
--

LOCK TABLES `user_cart` WRITE;
/*!40000 ALTER TABLE `user_cart` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_cart` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_favorites`
--

DROP TABLE IF EXISTS `user_favorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_favorites` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `goods_id` bigint NOT NULL COMMENT '商品ID',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_goods` (`user_id`,`goods_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_goods_id` (`goods_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户收藏表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_favorites`
--

LOCK TABLES `user_favorites` WRITE;
/*!40000 ALTER TABLE `user_favorites` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_favorites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_login_logs`
--

DROP TABLE IF EXISTS `user_login_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_login_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `login_type` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `login_ip` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `status` tinyint DEFAULT '1',
  `failure_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_email` (`email`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_login_logs`
--

LOCK TABLES `user_login_logs` WRITE;
/*!40000 ALTER TABLE `user_login_logs` DISABLE KEYS */;
INSERT INTO `user_login_logs` VALUES (1,11,'test1757691710@example.com','register','::1','curl/8.7.1',1,NULL,'2025-09-12 15:41:54'),(2,12,'cuidong111@gmail.com','register','::1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',1,NULL,'2025-09-12 16:00:57'),(3,NULL,'cuidong111@gmail.com','code','::1','curl/8.7.1',0,'验证码无效或已过期','2025-09-14 11:18:47'),(4,NULL,'cuidong111@gmail.com','code','::1','curl/8.7.1',0,'验证码无效或已过期','2025-09-14 11:19:38');
/*!40000 ALTER TABLE `user_login_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_wallet`
--

DROP TABLE IF EXISTS `user_wallet`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_wallet` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `balance` decimal(10,2) DEFAULT '0.00',
  `frozen_balance` decimal(10,2) DEFAULT '0.00',
  `total_income` decimal(10,2) DEFAULT '0.00',
  `total_expense` decimal(10,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户钱包表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_wallet`
--

LOCK TABLES `user_wallet` WRITE;
/*!40000 ALTER TABLE `user_wallet` DISABLE KEYS */;
INSERT INTO `user_wallet` VALUES (1,4,0.00,0.00,0.00,0.00,'2025-09-08 07:16:38','2025-09-08 07:16:38'),(2,1,0.00,0.00,0.00,0.00,'2025-09-08 08:09:42','2025-09-08 08:09:42'),(3,12,0.00,0.00,0.00,0.00,'2025-09-12 16:05:28','2025-09-12 16:05:28');
/*!40000 ALTER TABLE `user_wallet` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '用户名',
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '邮箱',
  `password` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '密码（加密后）',
  `nickname` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '昵称',
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '头像URL',
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '手机号',
  `status` tinyint DEFAULT '1' COMMENT '状态：1-正常，0-禁用',
  `role` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'user' COMMENT '角色：admin-管理员，user-普通用户',
  `last_login_time` datetime DEFAULT NULL COMMENT '最后登录时间',
  `last_login_ip` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '最后登录IP',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `email_2` (`email`),
  UNIQUE KEY `email_3` (`email`),
  UNIQUE KEY `email_4` (`email`),
  UNIQUE KEY `email_5` (`email`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `username_2` (`username`),
  UNIQUE KEY `username_3` (`username`),
  UNIQUE KEY `username_4` (`username`),
  UNIQUE KEY `username_5` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'test','test@example.com','$2b$10$/eagfHLuULKLujmYPwFDmujBVQw0DPytm788o9hp4do3Yifq061gq','测试用户',NULL,NULL,1,'user','2025-09-12 02:27:08','::1','2025-09-04 15:42:38','2025-09-04 15:42:38'),(2,'newuser','newuser@example.com','$2b$10$PYJfIZX9XpfEVwdDfmJU2exa8EtGdLINtlQZ3ENx8A4Uiks/GxwIK','新用户',NULL,NULL,1,'user','2025-09-04 16:16:30','::ffff:127.0.0.1','2025-09-04 16:16:09','2025-09-04 16:16:09'),(3,'newtest','newtest@example.com','$2b$10$EPbOT82K6wyA2jSAogE/e.In5pEmhTqOftbdV8pG5AWgWLxKJ0e/K','新测试用户',NULL,NULL,1,'user','2025-09-04 21:38:27','::1','2025-09-04 21:38:13','2025-09-04 21:38:13'),(4,'333','333@gamil.com','$2b$10$MNvnq/lP.yE2qIJ8Pn1OBe6dvztdGIYgqWTRYO5tuzBmnJdEofwE2','落尘',NULL,NULL,1,'user',NULL,NULL,'2025-09-07 23:09:52','2025-09-07 23:09:52'),(5,'testfav','testfav@example.com','$2b$10$la.hmxhe7aKYlJg7nu42o.R2FemBLwuOkEhy9nm7KT0SoDlj1aOvq','testfav',NULL,NULL,1,'user',NULL,NULL,'2025-09-12 18:24:18','2025-09-12 18:24:18'),(6,'test2','test2@example.com','$2b$10$MCu2/IGlgzswGSv8kudJ/.KHmw3KBN.q0IjF.Gglnmgsz.i7z569a','test2',NULL,NULL,1,'user',NULL,NULL,'2025-09-12 22:20:12','2025-09-12 22:20:12'),(11,'test1757691710','test1757691710@example.com','$2b$10$.vCOrhKSmRGzumpF0l6p5uAfkT7N/EnFxUxOsvfzJUaO7Mtg9dkAS','test1757691710',NULL,NULL,1,'user',NULL,NULL,'2025-09-12 23:41:54','2025-09-12 23:41:54'),(12,'cuidong111','cuidong111@gmail.com','$2b$10$8NMZVtKbTQ7zFcDOWREm5.s5p5mOs.ePOEJ6vz1YPuX/AwRfmMH9m','cuidong111',NULL,NULL,1,'user','2025-09-14 19:35:14','::1','2025-09-13 00:00:57','2025-09-13 00:00:57'),(13,'admin','admin@example.com','$2b$10$yJBrlvIEN/WPJ2eq89xetuv8kfz5LWn830s/DWA4EoYwBVKzifaJG',NULL,NULL,NULL,1,'admin','2025-09-15 09:01:18','::1','2025-09-13 20:35:57','2025-09-13 20:35:57'),(15,'newuser123_1757849098885','newuser123@gmail.com','$2b$10$0i32g4gDHGiDYA8r1Zqsz.cQbus.ISAonPQ3w59DJhFUTC6X9pxXO','newuser123',NULL,NULL,1,'user','2025-09-14 19:24:58','::1','2025-09-14 19:24:58','2025-09-14 19:24:58'),(16,'cuidong111_1757901818573','cuidong111@gmalil.com','$2b$10$7pGJi6UdC0YJ3tJnHJlryuNfFhvQ/2Du5ezYVkZNUXrISmrcWkGZC','cuidong111',NULL,NULL,1,'user','2025-09-15 10:03:38','::1','2025-09-15 10:03:38','2025-09-15 10:03:38');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vip_users`
--

DROP TABLE IF EXISTS `vip_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vip_users` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `userId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `userPhone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `level` int DEFAULT '1',
  `levelName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `points` int DEFAULT '0',
  `totalRecharge` decimal(10,2) DEFAULT '0.00',
  `totalWithdraw` decimal(10,2) DEFAULT '0.00',
  `monthlyRecharge` decimal(10,2) DEFAULT '0.00',
  `benefits` json DEFAULT NULL,
  `expireTime` datetime DEFAULT NULL,
  `status` enum('active','expired','suspended') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `userId` (`userId`),
  UNIQUE KEY `userId_2` (`userId`),
  UNIQUE KEY `userId_3` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vip_users`
--

LOCK TABLES `vip_users` WRITE;
/*!40000 ALTER TABLE `vip_users` DISABLE KEYS */;
/*!40000 ALTER TABLE `vip_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wallet_transactions`
--

DROP TABLE IF EXISTS `wallet_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wallet_transactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `type` enum('recharge','withdraw','purchase','refund','income') NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `balance_after` decimal(10,2) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `order_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='钱包交易记录表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wallet_transactions`
--

LOCK TABLES `wallet_transactions` WRITE;
/*!40000 ALTER TABLE `wallet_transactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `wallet_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `withdraw_records`
--

DROP TABLE IF EXISTS `withdraw_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `withdraw_records` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `orderId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `fee` decimal(10,2) DEFAULT '0.00',
  `actualAmount` decimal(10,2) DEFAULT NULL,
  `method` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `account` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `accountName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bankName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pending','processing','completed','rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `remark` text COLLATE utf8mb4_unicode_ci,
  `rejectReason` text COLLATE utf8mb4_unicode_ci,
  `operatorId` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `operatorName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `processedTime` datetime DEFAULT NULL,
  `completedTime` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `orderId` (`orderId`),
  UNIQUE KEY `orderId_2` (`orderId`),
  UNIQUE KEY `orderId_3` (`orderId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `withdraw_records`
--

LOCK TABLES `withdraw_records` WRITE;
/*!40000 ALTER TABLE `withdraw_records` DISABLE KEYS */;
/*!40000 ALTER TABLE `withdraw_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `work_orders`
--

DROP TABLE IF EXISTS `work_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `work_orders` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `orderNo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','processing','completed','closed') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `priority` enum('low','medium','high','urgent') COLLATE utf8mb4_unicode_ci DEFAULT 'medium',
  `description` text COLLATE utf8mb4_unicode_ci,
  `userId` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `userName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `userPhone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `assignee` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `assigneeName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `images` json DEFAULT NULL,
  `reply` text COLLATE utf8mb4_unicode_ci,
  `closedTime` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `orderNo` (`orderNo`),
  UNIQUE KEY `orderNo_2` (`orderNo`),
  UNIQUE KEY `orderNo_3` (`orderNo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `work_orders`
--

LOCK TABLES `work_orders` WRITE;
/*!40000 ALTER TABLE `work_orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `work_orders` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-17 21:42:17
