import { initToolShell } from './common.mjs';

const SUPPORT_EMAIL = 'support@utilune.com';
const SUPPORT_LINK = `<a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>`;
const LANGS = ['en-US', 'es-ES', 'pt-BR', 'fr-FR', 'de-DE', 'nl-NL', 'ja-JP', 'ko-KR', 'zh-CN'];

const PRIVACY_BODY = {
  'en-US': `
    <h1>Privacy Policy</h1>
    <p class="updated">Last updated: August 1, 2026</p>
    <p>This Privacy Policy explains how Utilune ("we" or "us") handles information when you use our Figma plugins, including LayerShuttle and TokenShuttle, our future plugins, and the browser tools on <a href="https://utilune.com">utilune.com</a>.</p>

    <h2>1. Local processing of your files</h2>
    <p>Our plugins process supported design content inside Figma, and our image tools process images inside your browser. We do not upload your <code>.xd</code> files, Figma document contents, images, or generated files to Utilune servers. Please keep your own backups of important files.</p>

    <h2>2. Information we process</h2>
    <ul>
      <li><strong>License information:</strong> When you activate, validate, or deactivate a paid license, our license service receives the license key, requested product, plugin instance name or identifier, license status, plan, expiration information, and activation-related timestamps. This is needed to enforce plan and device limits and to let you release a device.</li>
      <li><strong>Purchase information:</strong> Purchases are completed through Creem, our merchant of record and payment provider. Creem collects payment, billing, tax, order, and contact information under its own privacy notice. We may receive order and customer details needed to deliver licenses, provide support, prevent fraud, and handle refunds. We do not receive or store full payment-card details.</li>
      <li><strong>Support communications:</strong> If you contact us, we receive the email address, message, attachments, and other information you choose to provide.</li>
      <li><strong>Website preferences and technical data:</strong> Your language choice is stored locally in your browser. We do not use advertising trackers or build advertising profiles. Our hosting and infrastructure providers may process basic technical logs, such as IP address, browser type, request time, and requested page, for delivery, reliability, and security.</li>
    </ul>

    <h2>3. How we use information</h2>
    <p>We use information only to operate and secure the products, validate licenses, manage device activation and deactivation, provide customer support, deliver purchases, process refunds, diagnose failures, prevent abuse, and comply with legal or accounting obligations.</p>

    <h2>4. Service providers and third parties</h2>
    <p>We may share only the information needed with providers that support payments and licensing (including Creem), hosting and infrastructure (including Cloudflare and our website host), and email or customer support. These providers process information under their own terms or on our behalf. We do not sell personal information or share it for behavioral advertising.</p>
    <p>Figma, Adobe, Google/Android, and other third-party platforms have separate privacy policies. Figma may process and share information related to Community resources under its own terms. Utilune does not control those third-party practices.</p>

    <h2>5. Retention and security</h2>
    <p>We keep license and activation records while needed to provide and protect the license, and we keep support, order, refund, tax, and accounting records for as long as reasonably required for those purposes or by law. We use reasonable safeguards, but no online service can guarantee absolute security.</p>

    <h2>6. Your choices and rights</h2>
    <p>You can deactivate the current device inside supported plugins. You may also contact us to request access, correction, or deletion of personal information we control, or to object to or restrict certain processing where applicable. We may need to verify your request and may retain records required for security, accounting, dispute resolution, or legal compliance.</p>

    <h2>7. International processing and children</h2>
    <p>Our service providers may process information in countries other than yours, subject to their safeguards and applicable law. Utilune products are not directed to children under 13, or a higher minimum age where local law requires it.</p>

    <h2>8. Changes and contact</h2>
    <p>We may update this policy when our products or legal obligations change. The date above shows the latest version. Privacy questions and requests can be sent to ${SUPPORT_LINK}.</p>
    <a class="back" href="index.html">&larr; Back to Utilune</a>
  `,
  'zh-CN': `
    <h1>隐私政策</h1>
    <p class="updated">最后更新：2026 年 8 月 1 日</p>
    <p>本隐私政策说明 Utilune（以下简称“我们”）在你使用 LayerShuttle、TokenShuttle、今后发布的 Figma 插件，以及 <a href="https://utilune.com">utilune.com</a> 上的浏览器工具时，如何处理相关信息。</p>

    <h2>1. 文件在本地处理</h2>
    <p>插件会在 Figma 内处理支持的设计内容，图片工具会在你的浏览器内处理图片。我们不会把你的 <code>.xd</code> 文件、Figma 文档内容、图片或生成文件上传到 Utilune 服务器。重要文件请自行保留备份。</p>

    <h2>2. 我们处理的信息</h2>
    <ul>
      <li><strong>授权信息：</strong>当你激活、校验或解除付费授权时，授权服务会接收授权码、所请求的产品、插件实例名称或标识、授权状态、套餐、到期信息及激活相关时间。这些信息用于执行套餐和设备数量限制，并支持解除当前设备绑定。</li>
      <li><strong>购买信息：</strong>购买通过我们的记录商户和支付服务商 Creem 完成。Creem 会根据其隐私政策处理付款、账单、税务、订单和联系方式。我们可能收到交付授权、提供支持、防止欺诈和处理退款所需的订单及客户信息。我们不会接收或保存完整银行卡信息。</li>
      <li><strong>支持沟通：</strong>当你联系我们时，我们会收到你的邮箱地址、消息、附件，以及你主动提供的其他信息。</li>
      <li><strong>网站偏好和技术信息：</strong>你选择的语言仅保存在浏览器本地。我们不使用广告追踪器，也不建立广告画像。网站托管和基础设施服务商可能为了页面传输、稳定性和安全，处理 IP 地址、浏览器类型、请求时间和访问页面等基础技术日志。</li>
    </ul>

    <h2>3. 信息用途</h2>
    <p>我们仅将相关信息用于运行和保护产品、验证授权、管理设备激活和解绑、提供客户支持、交付购买内容、处理退款、诊断故障、防止滥用，以及履行法律或会计义务。</p>

    <h2>4. 服务商和第三方平台</h2>
    <p>我们可能仅在必要范围内与付款及授权服务商（包括 Creem）、托管及基础设施服务商（包括 Cloudflare 和网站托管方）、邮件或客户支持服务商共享信息。这些服务商会依据自己的条款或代表我们处理信息。我们不会出售个人信息，也不会将个人信息用于行为广告。</p>
    <p>Figma、Adobe、Google/Android 等第三方平台有各自的隐私政策。Figma 可能依据其条款处理和共享与 Community 资源有关的信息，这些第三方行为不受 Utilune 控制。</p>

    <h2>5. 保存期限和安全</h2>
    <p>授权及激活记录会在提供和保护授权所需期间保存；支持、订单、退款、税务和会计记录会在合理需要或法律要求的期间保存。我们会采取合理的安全措施，但任何在线服务都无法保证绝对安全。</p>

    <h2>6. 你的选择和权利</h2>
    <p>支持该功能的插件允许你在插件内解除当前设备绑定。你也可以联系我们，要求查询、更正或删除我们控制的个人信息；在适用法律允许时，也可以反对或限制特定处理。我们可能需要验证申请人的身份，并可能继续保留安全、会计、争议处理或法律要求必须保存的记录。</p>

    <h2>7. 跨境处理和未成年人</h2>
    <p>我们的服务商可能在你所在国家或地区以外处理信息，并应遵守其安全措施和适用法律。Utilune 产品不面向 13 岁以下儿童；如果当地法律规定了更高的最低年龄，则以当地规定为准。</p>

    <h2>8. 政策变更和联系</h2>
    <p>产品或法律要求发生变化时，我们可能更新本政策，页面顶部日期代表最新版本。隐私问题或相关申请请发送至 ${SUPPORT_LINK}。</p>
    <a class="back" href="index.html">&larr; 返回 Utilune</a>
  `
};

const TERMS_BODY = {
  'en-US': `
    <h1>Terms of Service</h1>
    <p class="updated">Last updated: August 1, 2026</p>
    <p>These Terms govern your use of Utilune Figma plugins, including LayerShuttle and TokenShuttle, future Utilune plugins, and the browser tools on <a href="https://utilune.com">utilune.com</a>. By installing, purchasing, or using a product, you agree to these Terms. If you do not agree, do not use the product.</p>

    <h2>1. Products and eligibility</h2>
    <p>Utilune provides design-workflow plugins and local-first browser tools. You must be legally able to enter into these Terms. If you use a product for an organization, you confirm that you have authority to accept these Terms for that organization.</p>

    <h2>2. Your files, rights, and backups</h2>
    <p>You keep ownership of your files and output. You are responsible for having the rights and permissions needed to process any file or content, reviewing results before relying on them, and keeping backups. Do not use the products to infringe intellectual-property, privacy, confidentiality, or other rights.</p>

    <h2>3. License to use the products</h2>
    <p>Subject to these Terms and payment of applicable fees, we grant you a limited, non-exclusive, non-transferable, non-sublicensable right to use the products for personal or internal business purposes, including commercial design work. You may not resell, rent, redistribute, copy, republish, or provide the products or license keys to others; remove ownership notices; bypass usage, payment, or device limits; or reverse engineer the products except where applicable law does not allow that restriction.</p>

    <h2>4. Free use, paid plans, and devices</h2>
    <p>Free plans or trials may have usage limits that can change for future use. Paid access applies only to the product or All-Access package shown at checkout. Subscription plans currently allow one activated device and Lifetime plans currently allow two, unless the checkout page states otherwise. A device slot is released only after successful deactivation. We may reset, refuse, or revoke activations affected by sharing, resale, fraud, abuse, chargebacks, or technical manipulation.</p>

    <h2>5. Subscriptions, Lifetime, and All-Access</h2>
    <p>Subscriptions renew for the billing period shown at checkout until canceled through the payment provider. Cancellation stops future renewal but does not automatically refund a completed charge. "Lifetime" means a perpetual license to the purchased product version and updates we make available for that product while it remains offered and technically supported; it does not guarantee that Figma, operating systems, browsers, third-party APIs, online license services, or every feature will remain available forever. All-Access includes the Utilune plugins identified as included at purchase and future Utilune plugins we release for general sale under that package, but does not include unrelated services, custom work, source code, or third-party products.</p>

    <h2>6. Payments, taxes, and refunds</h2>
    <p>Creem acts as the merchant of record for purchases, processes payment, handles applicable indirect taxes, and issues transaction documents under its buyer terms. Prices and billing periods are shown at checkout. For an initial purchase made through our checkout, you may request a full refund within 14 calendar days by emailing ${SUPPORT_LINK} with enough order information to locate the purchase. When a refund is issued, the related license ends and must no longer be used. This policy does not limit any mandatory consumer rights.</p>

    <h2>7. Acceptable use</h2>
    <p>You must not use the products unlawfully; introduce malware; steal or expose data; interfere with Figma, Utilune, the license service, or another service; probe or overload systems; automate abusive requests; share fraudulent keys; or help others avoid plan limits or payment.</p>

    <h2>8. Intellectual property</h2>
    <p>Utilune and its products, code, branding, interface, documentation, and related materials remain owned by us or our licensors. These Terms grant a right to use the products, not ownership of them. Third-party names and trademarks remain the property of their respective owners.</p>

    <h2>9. Third-party services and no affiliation</h2>
    <p>The products depend on third-party services such as Figma, Creem, Cloudflare, browsers, and operating systems. Your use of those services is also subject to their terms. Utilune is an independent developer and is not affiliated with, sponsored by, or endorsed by Figma, Adobe, Google, Android, Creem, or their affiliates unless expressly stated.</p>

    <h2>10. Changes, availability, and termination</h2>
    <p>We may fix, update, replace, suspend, or discontinue features to maintain security, compatibility, legal compliance, or product quality. We may suspend or terminate access for a material breach of these Terms, fraud, abuse, or nonpayment. Where practical, we will provide reasonable notice of material changes. Sections that by their nature should survive termination will continue to apply.</p>

    <h2>11. Disclaimers</h2>
    <p>To the maximum extent permitted by law, the products are provided &quot;as is&quot; and &quot;as available&quot;. Conversion, matching, compression, and generation results depend on source files and third-party platforms. We do not promise uninterrupted operation, error-free output, exact visual fidelity, or fitness for a particular purpose. The products do not provide legal, tax, accounting, or other professional advice.</p>

    <h2>12. Limitation of liability</h2>
    <p>To the maximum extent permitted by law, Utilune will not be liable for indirect, incidental, special, consequential, or punitive damages, or for lost profits, business, goodwill, data, or files. Our total liability arising from a product will not exceed the amount you paid for that product during the 12 months before the event giving rise to the claim. These limits do not apply where they are prohibited by law. Keep backups and review output before using it in production.</p>

    <h2>13. General terms</h2>
    <p>If part of these Terms is unenforceable, the remaining parts continue to apply. A failure to enforce a term is not a waiver. You may not transfer your license or these Terms without our consent; we may transfer them as part of a reorganization, merger, or sale of the relevant product, subject to applicable law. Mandatory consumer protections in your country or region remain unaffected.</p>

    <h2>14. Changes and contact</h2>
    <p>We may update these Terms for future use when products, providers, or legal requirements change. Material changes will be reflected by the date above and, where practical, an additional notice. Questions, refund requests, or disputes should first be sent to ${SUPPORT_LINK} so we can try to resolve them promptly.</p>
    <a class="back" href="index.html">&larr; Back to Utilune</a>
  `,
  'zh-CN': `
    <h1>服务条款</h1>
    <p class="updated">最后更新：2026 年 8 月 1 日</p>
    <p>本条款适用于你使用 LayerShuttle、TokenShuttle、今后发布的 Utilune Figma 插件，以及 <a href="https://utilune.com">utilune.com</a> 上的浏览器工具。安装、购买或使用产品，即表示你同意本条款；如果不同意，请不要使用。</p>

    <h2>1. 产品和使用资格</h2>
    <p>Utilune 提供围绕设计工作流的插件和本地优先浏览器工具。你必须具备同意本条款所需的法律行为能力。如果你代表组织使用产品，即表示你有权代表该组织接受本条款。</p>

    <h2>2. 你的文件、权利和备份</h2>
    <p>你的文件和输出结果仍归你所有。你有责任确保自己有权处理相关文件或内容，在依赖输出前检查结果，并保留备份。不得使用产品侵犯知识产权、隐私权、保密义务或其他权利。</p>

    <h2>3. 产品使用授权</h2>
    <p>在遵守本条款并支付适用费用的前提下，我们授予你有限、非独占、不可转让、不可再授权的使用权，可用于个人或组织内部业务，包括商业设计工作。你不得转售、出租、再分发、复制、重新发布产品或授权码，不得移除权利声明、绕过次数、付款或设备限制，也不得进行逆向工程，但适用法律不允许限制的情况除外。</p>

    <h2>4. 免费使用、付费套餐和设备</h2>
    <p>免费版或试用版可能有次数限制；我们可以调整未来的免费使用额度。付费权限仅适用于结账页面列明的单个产品或 All-Access 套餐。除非结账页面另有说明，订阅套餐目前支持激活 1 台设备，Lifetime 套餐目前支持 2 台设备。只有成功解除绑定后，设备名额才会释放。对于授权共享、转售、欺诈、滥用、拒付或技术绕过造成的激活，我们可以重置、拒绝或撤销。</p>

    <h2>5. 订阅、Lifetime 和 All-Access</h2>
    <p>订阅会按结账页面显示的周期自动续费，直至你通过支付服务商取消。取消只会停止后续续费，不会自动退还已经完成的扣款。“Lifetime”指对已购产品版本，以及该产品仍在销售并获得技术支持期间由我们提供的更新，享有永久使用授权；它不保证 Figma、操作系统、浏览器、第三方 API、在线授权服务或所有功能永远可用。All-Access 包含购买时列明的 Utilune 插件，以及今后由我们正式发布并纳入该套餐销售的 Utilune 插件，但不包含无关服务、定制工作、源代码或第三方产品。</p>

    <h2>6. 付款、税费和退款</h2>
    <p>Creem 是购买交易的记录商户，依据其买家条款处理付款、适用的间接税和交易凭证；价格和计费周期以结账页面为准。首次通过我们结账页面购买后，你可以在 14 个自然日内发送邮件至 ${SUPPORT_LINK}，并提供足以查询订单的信息，申请全额退款。退款完成后，对应授权同时终止，不得继续使用。本退款政策不限制法律规定的强制性消费者权利。</p>

    <h2>7. 合理使用</h2>
    <p>不得将产品用于违法活动，不得植入恶意程序、窃取或泄露数据、干扰 Figma、Utilune、授权服务或其他服务，不得探测或压垮系统、自动发送滥用请求、分享欺诈授权码，或帮助他人绕过套餐限制和付款。</p>

    <h2>8. 知识产权</h2>
    <p>Utilune 及其产品、代码、品牌、界面、文档和相关材料的权利仍归我们或授权方所有。本条款只授予产品使用权，不转让产品所有权。第三方名称和商标归各自权利人所有。</p>

    <h2>9. 第三方服务和无关联声明</h2>
    <p>产品依赖 Figma、Creem、Cloudflare、浏览器和操作系统等第三方服务，你使用这些服务时还应遵守其条款。除非明确说明，Utilune 是独立开发者，与 Figma、Adobe、Google、Android、Creem 及其关联方不存在隶属、赞助或背书关系。</p>

    <h2>10. 变更、可用性和终止</h2>
    <p>为了安全、兼容性、法律合规或产品质量，我们可以修复、更新、替换、暂停或停止部分功能。发生重大违约、欺诈、滥用或未付款时，我们可以暂停或终止访问。对于重大变化，我们会在合理可行时提前通知。按其性质应在终止后继续有效的条款，终止后仍然有效。</p>

    <h2>11. 免责声明</h2>
    <p>在法律允许的最大范围内，产品按“现状”和“可用状态”提供。转换、匹配、压缩和生成结果会受到源文件及第三方平台影响。我们不保证服务不中断、输出完全无误、视觉效果绝对一致，或适合某个特定用途。产品不提供法律、税务、会计或其他专业建议。</p>

    <h2>12. 责任限制</h2>
    <p>在法律允许的最大范围内，Utilune 不对间接、附带、特殊、衍生或惩罚性损失，也不对利润、业务、商誉、数据或文件损失承担责任。与某项产品有关的责任总额，不超过引发索赔事件前 12 个月内你为该产品支付的金额；法律禁止限制的情况除外。请保留备份，并在投入生产前检查输出。</p>

    <h2>13. 一般条款</h2>
    <p>本条款某部分无法执行时，其余部分仍然有效。我们未立即执行某项条款，不代表放弃该权利。未经我们同意，你不得转让授权或本条款；在适用法律允许的范围内，我们可以在业务重组、合并或相关产品出售时进行转让。你所在国家或地区的强制性消费者保护权利不受影响。</p>

    <h2>14. 条款变更和联系</h2>
    <p>产品、服务商或法律要求发生变化时，我们可能更新适用于后续使用的条款。重大变化会更新页面顶部日期，并在合理可行时另行提示。条款问题、退款申请或争议，请先发送至 ${SUPPORT_LINK}，以便我们尽快处理。</p>
    <a class="back" href="index.html">&larr; 返回 Utilune</a>
  `
};

const META = {
  privacy: {
    'en-US': ['Privacy Policy - Utilune', 'How Utilune handles information for its Figma plugins, licensing, purchases, and local browser tools.'],
    'zh-CN': ['隐私政策 - Utilune', '了解 Utilune 的 Figma 插件、授权、购买和本地浏览器工具如何处理信息。']
  },
  terms: {
    'en-US': ['Terms of Service - Utilune', 'Terms for Utilune Figma plugins, paid licenses, All-Access, refunds, and browser tools.'],
    'zh-CN': ['服务条款 - Utilune', '适用于 Utilune Figma 插件、付费授权、All-Access、退款和浏览器工具的服务条款。']
  }
};

function localize(bodyByLanguage, metaByLanguage) {
  const result = {};
  for (const lang of LANGS) {
    const body = bodyByLanguage[lang] || bodyByLanguage['en-US'];
    const meta = metaByLanguage[lang] || metaByLanguage['en-US'];
    result[lang] = { body, meta_title: meta[0], meta_description: meta[1] };
  }
  return result;
}

const PAGE_DICTS = {
  privacy: localize(PRIVACY_BODY, META.privacy),
  terms: localize(TERMS_BODY, META.terms)
};

export function initInfoPage(pageId) {
  return initToolShell(PAGE_DICTS[pageId] || PAGE_DICTS.privacy);
}
