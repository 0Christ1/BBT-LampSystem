import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  const hostname = window.location.hostname;

  if (hostname && !['localhost', '127.0.0.1'].includes(hostname)) {
    return `${window.location.protocol}//${hostname}:5001`;
  }

  return 'http://localhost:5001';
};

const API_BASE_URL = getApiBaseUrl();

const fallbackLampOptions = [
  {
    id: 'peace',
    label: '平安光明灯',
    shortLabel: '平安灯',
    description:
      '为个人或阖家祈愿身心安稳、出入平安、福慧增长，适合全年供灯祈福。',
    plans: [
      {
        id: 'personal',
        label: '个人',
        code: 'PP',
        amount: 88,
        duration: '1年',
      },
      { id: 'family', label: '阖家', code: 'PF', amount: 188, duration: '1年' },
    ],
  },
  {
    id: 'wealth',
    label: '财富光明灯',
    shortLabel: '财富灯',
    description:
      '为事业、公司、财富资粮与善缘增长祈福，适合功德主、公司或个人供灯。',
    plans: [
      {
        id: 'great-patron',
        label: '大功德主',
        code: 'WG',
        amount: 888,
        duration: '3年',
      },
      {
        id: 'company',
        label: '公司',
        code: 'WC',
        amount: 188,
        duration: '1年',
      },
      {
        id: 'personal',
        label: '个人',
        code: 'WP',
        amount: 88,
        duration: '1年',
      },
    ],
  },
];

const lampStories = {
  peace: {
    title: '平安光明灯',
    eyebrow: '观音殿常明祈福',
    image: '/lamp-assets/peace-lamp.jpg',
    lead: '为自己与家人点亮平安灯，可消灾除厄、身心安稳、家宅安宁、福寿吉祥。',
    paragraphs: [
      '佛前点灯，寓意破除黑暗、照耀前程。于本寺观音殿点亮平安光明灯将日夜融汇在观世音菩萨的慈悲护佑之中。',
      '于诸佛菩萨圣诞及重要节日，本寺将带领大众诵经、修法、祈福，并将点灯功德回向点灯者及其眷属。',
    ],
  },
  wealth: {
    title: '财富光明灯',
    eyebrow: '财神殿昼夜加持',
    image: '/lamp-assets/wealth-lamp.jpg',
    lead: '为事业、公司与个人点亮财富光明灯，可使福报增长、财源广进、事业风生水起。',
    paragraphs: [
      '财宝天王又名多闻天王，管理世间功德与福报转化，使一切众生脱离贫困灾难，增长善法、财富、及好运。',
      '凡长年点灯者，日夜融汇在财宝天王的慈悲加持庇护之中，事业顺利，鸿图大展，求财满愿。',
    ],
    note: '大功德主名额仅限39位，特制芳名牌将置于财富灯最顶部 !',
  },
};

const regionOptions = [
  { value: 'usa', label: '美国' },
  { value: 'asia', label: '亚洲' },
  { value: 'other', label: '其他' },
];

const paymentLabel = '汇款/现金/Zelle/支票/汇票/银行本票';

const getApplicationProfile = (lampType, planId) => {
  if (lampType === 'wealth' && planId === 'company') {
    return {
      primaryField: 'companyName',
      primaryLabel: '公司名字',
      primaryPlaceholder: '请输入公司名字',
      primaryError: '请填写公司名字',
      showFamilyMembers: false,
    };
  }

  if (lampType === 'wealth' && planId === 'great-patron') {
    return {
      primaryField: 'greatPatronName',
      primaryLabel: '大功德主姓名',
      primaryPlaceholder: '请输入大功德主姓名',
      primaryError: '请填写大功德主姓名',
      showFamilyMembers: false,
    };
  }

  return {
    primaryField: 'donorName',
    primaryLabel: '点灯功德主姓名',
    primaryPlaceholder: '请输入功德主姓名',
    primaryError: '请填写点灯功德主姓名',
    showFamilyMembers: lampType === 'peace' && planId === 'family',
  };
};

const initialForm = {
  applicantName: '',
  dharmaName: '',
  birthday: '',
  region: 'usa',
  email: '',
  phone: '',
  donorName: '',
  companyName: '',
  greatPatronName: '',
  familyMembers: '',
  paymentMethod: 'offline_transfer',
};

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

function App() {
  const [lampOptions, setLampOptions] = useState(fallbackLampOptions);
  const [selectedLampId, setSelectedLampId] = useState('peace');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [step, setStep] = useState('intro');
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [application, setApplication] = useState(null);

  useEffect(() => {
    let active = true;

    const loadOptions = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/lamp-options`);

        if (!response.ok) {
          throw new Error('Cannot load options');
        }

        const result = await response.json();

        if (active && Array.isArray(result.data)) {
          setLampOptions(result.data);
        }
      } catch (error) {
        console.warn('Using local lamp options.', error);
      }
    };

    loadOptions();

    return () => {
      active = false;
    };
  }, []);

  const selectedLamp =
    lampOptions.find((item) => item.id === selectedLampId) || lampOptions[0];

  const selectedInfo = selectedPlan
    ? {
        lamp:
          lampOptions.find((item) => item.id === selectedPlan.lampType) ||
          selectedLamp,
        plan: selectedPlan,
      }
    : null;

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  };

  const openPlanModal = () => {
    setIsPlanModalOpen(true);
  };

  const choosePlan = (plan) => {
    setSelectedPlan({ ...plan, lampType: selectedLamp.id });
    setForm(initialForm);
    setErrors({});
    setSubmitError('');
    setConfirmOpen(false);
    setIsPlanModalOpen(false);
    setStep('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const validateForm = () => {
    const nextErrors = {};
    const profile = selectedInfo
      ? getApplicationProfile(selectedInfo.lamp.id, selectedInfo.plan.id)
      : null;

    if (!form.applicantName.trim()) {
      nextErrors.applicantName = '请填写姓名';
    }

    if (!form.region) {
      nextErrors.region = '请选择地区';
    }

    if (!form.email.trim()) {
      nextErrors.email = '请填写电子邮箱';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = '请填写有效的电子邮箱';
    }

    if (profile && !form[profile.primaryField].trim()) {
      nextErrors[profile.primaryField] = profile.primaryError;
    }

    if (profile?.showFamilyMembers && !form.familyMembers.trim()) {
      nextErrors.familyMembers = '请填写家人名单';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleBlessingClick = () => {
    setSubmitError('');

    if (validateForm()) {
      setConfirmOpen(true);
    }
  };

  const submitApplication = async () => {
    if (!selectedInfo) {
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lampType: selectedInfo.lamp.id,
          planId: selectedInfo.plan.id,
          ...form,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || '点灯申请提交失败。');
      }

      setApplication(result.data);
      setConfirmOpen(false);
      setStep('notice');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setSubmitError(error.message || '点灯申请提交失败，请稍后再试。');
    } finally {
      setSubmitting(false);
    }
  };

  const resetFlow = () => {
    setStep('intro');
    setSelectedPlan(null);
    setForm(initialForm);
    setApplication(null);
    setSubmitError('');
    setConfirmOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goLogin = () => {
    setStep('login');
    setIsPlanModalOpen(false);
    setConfirmOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="app-shell">
      <div className="topbar">
        <div>
          <p className="eyebrow">Benevolent Buddhist Temple</p>
          <h1>慈行寺光明灯申请系统</h1>
        </div>
        <div className="step-indicator" aria-label="申请进度">
          <span className={step === 'intro' ? 'active' : ''}>介绍</span>
          <span className={step === 'form' ? 'active' : ''}>填写资料</span>
          <span className={step === 'notice' ? 'active' : ''}>通知</span>
        </div>
      </div>

      {step === 'intro' && (
        <IntroPage
          lampOptions={lampOptions}
          selectedLampId={selectedLampId}
          selectedLamp={selectedLamp}
          setSelectedLampId={setSelectedLampId}
          openPlanModal={openPlanModal}
          onLogin={goLogin}
        />
      )}

      {step === 'form' && selectedInfo && (
        <ApplicationForm
          selectedInfo={selectedInfo}
          form={form}
          errors={errors}
          updateForm={updateForm}
          submitError={submitError}
          onBack={() => setStep('intro')}
          onBlessing={handleBlessingClick}
        />
      )}

      {step === 'notice' && application && (
        <NoticePage
          application={application}
          onNewApplication={resetFlow}
          onLogin={goLogin}
        />
      )}

      {step === 'login' && <LoginPage onBack={() => setStep('intro')} />}

      {isPlanModalOpen && selectedLamp && (
        <PlanModal
          lamp={selectedLamp}
          onClose={() => setIsPlanModalOpen(false)}
          onChoose={choosePlan}
        />
      )}

      {confirmOpen && selectedInfo && (
        <ConfirmModal
          selectedInfo={selectedInfo}
          form={form}
          submitting={submitting}
          submitError={submitError}
          onBack={() => setConfirmOpen(false)}
          onConfirm={submitApplication}
        />
      )}
    </main>
  );
}

function IntroPage({
  lampOptions,
  selectedLampId,
  selectedLamp,
  setSelectedLampId,
  openPlanModal,
  onLogin,
}) {
  return (
    <section className="intro-page">
      <div className="festival-hero">
        <div>
          <h2>佛前点灯、平安吉祥、诸事光明</h2>
        </div>
        <p>
          光明灯象征智慧、愿力与福报。慈行寺广邀大众点灯祈福，
          为自己、家人及企业祈愿消灾解厄、福德增长、诸事光明🙏🙏🙏
        </p>
      </div>

      <div className="lamp-showcase">
        {lampOptions.map((lamp) => (
          <article
            className={`festival-card ${
              selectedLampId === lamp.id ? 'selected' : ''
            }`}
            key={lamp.id}
            onClick={() => setSelectedLampId(lamp.id)}
          >
            <figure className="poster-frame">
              <img
                src={lampStories[lamp.id].image}
                alt={`${lamp.label}实景照片`}
              />
            </figure>

            <div className="festival-card-copy">
              <div className="lamp-choice-header">
                <label className="lamp-radio">
                  <input
                    type="radio"
                    name="lampType"
                    value={lamp.id}
                    checked={selectedLampId === lamp.id}
                    onChange={() => setSelectedLampId(lamp.id)}
                  />
                  <span>{lampStories[lamp.id].title}</span>
                </label>
                <span className="lamp-eyebrow">
                  {lampStories[lamp.id].eyebrow}
                </span>
              </div>

              <p className="lamp-lead">{lampStories[lamp.id].lead}</p>

              {lampStories[lamp.id].paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}

              {lampStories[lamp.id].note && (
                <p className="lamp-note">{lampStories[lamp.id].note}</p>
              )}
            </div>
          </article>
        ))}
      </div>

      <div className="action-band festival-action">
        <div>
          <p>目前选择</p>
          <strong>{selectedLamp?.label}</strong>
        </div>
        <div className="button-stack">
          <button
            className="primary-button"
            type="button"
            onClick={openPlanModal}
          >
            立即点灯
          </button>
          <button className="ghost-button" type="button" onClick={onLogin}>
            已点灯，请登录查询
          </button>
        </div>
      </div>
    </section>
  );
}

function PlanModal({ lamp, onClose, onChoose }) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-heading">
          <div>
            <p className="section-kicker">选择点灯项目</p>
            <h2>{lamp.label}</h2>
          </div>
          <button
            className="icon-button"
            type="button"
            onClick={onClose}
            aria-label="关闭"
          >
            ×
          </button>
        </div>
        <div className="plan-list">
          {lamp.plans.map((plan) => (
            <button
              className="plan-option"
              key={plan.id}
              type="button"
              onClick={() => onChoose(plan)}
            >
              <span>{plan.label}</span>
              <strong>{currency.format(plan.amount)}</strong>
              <small>{plan.duration}</small>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ApplicationForm({
  selectedInfo,
  form,
  errors,
  updateForm,
  submitError,
  onBack,
  onBlessing,
}) {
  const { lamp, plan } = selectedInfo;
  const profile = getApplicationProfile(lamp.id, plan.id);

  return (
    <section className="form-page">
      <div className="center-title">
        <p className="section-kicker">Lamp Application</p>
        <h2>填写点灯资料</h2>
      </div>

      <div className="selected-strip">
        <span>点灯信息：</span>
        <strong>
          {lamp.label}-{plan.label}
        </strong>
      </div>

      <form className="form-grid" onSubmit={(event) => event.preventDefault()}>
        <Field label="姓名" required error={errors.applicantName}>
          <input
            value={form.applicantName}
            onChange={(event) =>
              updateForm('applicantName', event.target.value)
            }
            placeholder="请输入姓名"
          />
        </Field>

        <Field label="法名">
          <input
            value={form.dharmaName}
            onChange={(event) => updateForm('dharmaName', event.target.value)}
            placeholder="如无可留空"
          />
        </Field>

        <Field label="生日">
          <input
            type="date"
            value={form.birthday}
            onChange={(event) => updateForm('birthday', event.target.value)}
          />
        </Field>

        <Field label="地区" required error={errors.region}>
          <select
            value={form.region}
            onChange={(event) => updateForm('region', event.target.value)}
          >
            {regionOptions.map((region) => (
              <option key={region.value} value={region.value}>
                {region.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="电子邮箱" required error={errors.email}>
          <input
            type="email"
            value={form.email}
            onChange={(event) => updateForm('email', event.target.value)}
            placeholder="请输入电子邮箱"
          />
        </Field>

        <Field label="手机号码" error={errors.phone}>
          <input
            type="tel"
            value={form.phone}
            onChange={(event) => updateForm('phone', event.target.value)}
            placeholder="选填"
          />
        </Field>

        <Field
          label={profile.primaryLabel}
          required
          error={errors[profile.primaryField]}
        >
          <input
            value={form[profile.primaryField]}
            onChange={(event) =>
              updateForm(profile.primaryField, event.target.value)
            }
            placeholder={profile.primaryPlaceholder}
          />
        </Field>

        {profile.showFamilyMembers && (
          <Field label="家人名单" required error={errors.familyMembers} wide>
            <textarea
              value={form.familyMembers}
              onChange={(event) =>
                updateForm('familyMembers', event.target.value)
              }
              placeholder="请逐行填写家人姓名，或以顿号、逗号分隔"
            />
          </Field>
        )}
      </form>

      <section className="payment-section">
        <h3>付款方式</h3>
        <div className="payment-options">
          <label className="payment-option disabled">
            <input type="radio" name="paymentMethod" disabled />
            <span>线上信用卡</span>
            <small>待开发中</small>
          </label>
          <label className="payment-option selected">
            <input
              type="radio"
              name="paymentMethod"
              value="offline_transfer"
              checked={form.paymentMethod === 'offline_transfer'}
              onChange={(event) =>
                updateForm('paymentMethod', event.target.value)
              }
            />
            <span>{paymentLabel}</span>
          </label>
        </div>
      </section>

      <section className="total-section">
        <div>
          <span>功德金</span>
          <strong>{currency.format(plan.amount)}</strong>
        </div>
        <div className="form-actions">
          <button className="ghost-button" type="button" onClick={onBack}>
            返回介绍
          </button>
          <button className="primary-button" type="button" onClick={onBlessing}>
            点灯祈福
          </button>
        </div>
      </section>

      {submitError && <p className="error-banner">{submitError}</p>}
    </section>
  );
}

function Field({
  label,
  required = false,
  error = '',
  children,
  wide = false,
}) {
  return (
    <label className={`field ${wide ? 'field-wide' : ''}`}>
      <span>
        {required && <b>*</b>}
        {label}
      </span>
      {children}
      {error && <small>{error}</small>}
    </label>
  );
}

function ConfirmModal({
  selectedInfo,
  form,
  submitting,
  submitError,
  onBack,
  onConfirm,
}) {
  const { lamp, plan } = selectedInfo;
  const profile = getApplicationProfile(lamp.id, plan.id);

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card confirm-card">
        <div>
          <p className="section-kicker">请确认资料</p>
          <h2>点灯申请明细</h2>
        </div>

        <dl className="detail-list">
          <div>
            <dt>{profile.primaryLabel}</dt>
            <dd>{form[profile.primaryField]}</dd>
          </div>
          <div>
            <dt>生日</dt>
            <dd>{form.birthday || '未填写'}</dd>
          </div>
          <div>
            <dt>电子邮箱</dt>
            <dd>{form.email}</dd>
          </div>
          <div>
            <dt>手机号码</dt>
            <dd>{form.phone || '未填写'}</dd>
          </div>
          {profile.showFamilyMembers && (
            <div>
              <dt>家人名单</dt>
              <dd>{form.familyMembers}</dd>
            </div>
          )}
          <div>
            <dt>功德金(美金)</dt>
            <dd>{currency.format(plan.amount)}</dd>
          </div>
          <div>
            <dt>付款方式</dt>
            <dd>{paymentLabel}</dd>
          </div>
        </dl>

        {submitError && <p className="error-banner">{submitError}</p>}

        <div className="modal-actions">
          <button className="ghost-button" type="button" onClick={onBack}>
            返回
          </button>
          <button
            className="primary-button"
            type="button"
            onClick={onConfirm}
            disabled={submitting}
          >
            {submitting ? '提交中...' : '确定'}
          </button>
        </div>
      </div>
    </div>
  );
}

function NoticePage({ application, onNewApplication, onLogin }) {
  const lampName = application.lampLabel || '光明灯';

  return (
    <section className="notice-page">
      <div className="success-header">
        <p>点灯申请编号</p>
        <h2>{application.applicationNo}</h2>
        <strong>您的{lampName}的点灯申请已成功提交！</strong>
      </div>

      <div className="instruction-block">
        <p className="deadline">
          请注意，您缴交功德金手续必须在提出申请后一个月内完成！
        </p>
        <p>
          光明祈福灯申请【确认信】将email到您登记的电子邮箱。因【确认信】为系统自动发出，
          部分电子邮箱可能会误判此【确认信】为垃圾信件，若您未能在收件夹收到此【确认信】，
          烦请您登入您的电子邮箱并到【垃圾信件匣】查看。
        </p>
      </div>

      <PaymentInstructions applicationNo={application.applicationNo} />

      <div className="notice-actions">
        <button
          className="primary-button"
          type="button"
          onClick={onNewApplication}
        >
          继续申请
        </button>
        <button className="ghost-button" type="button" onClick={onLogin}>
          登录查询点灯
        </button>
      </div>
    </section>
  );
}

function LoginPage({ onBack }) {
  const [loginForm, setLoginForm] = useState({
    applicationNo: '',
    contact: '',
  });
  const [message, setMessage] = useState('');

  const updateLoginForm = (field, value) => {
    setLoginForm((current) => ({ ...current, [field]: value }));
    setMessage('');
  };

  const submitLogin = (event) => {
    event.preventDefault();
    setMessage('登录查询功能将在后台管理和账号验证模块中开放。');
  };

  return (
    <section className="login-page">
      <div className="login-panel">
        <div>
          <p className="section-kicker">Lamp Inquiry</p>
          <h2>用户登录查询点灯</h2>
          <p>
            后续这里会接入短信或邮件验证码，供点灯人查询申请状态、确认信和功德金缴交记录。
          </p>
        </div>

        <form className="login-form" onSubmit={submitLogin}>
          <Field label="申请编号" required>
            <input
              value={loginForm.applicationNo}
              onChange={(event) =>
                updateLoginForm('applicationNo', event.target.value)
              }
              placeholder="例如 BBT20260506PP001"
            />
          </Field>

          <Field label="手机号码/电子邮箱" required>
            <input
              value={loginForm.contact}
              onChange={(event) =>
                updateLoginForm('contact', event.target.value)
              }
              placeholder="请输入登记时使用的联系方式"
            />
          </Field>

          {message && <p className="notice-line login-message">{message}</p>}

          <div className="login-actions">
            <button className="ghost-button" type="button" onClick={onBack}>
              返回介绍
            </button>
            <button className="primary-button" type="submit">
              登录查询
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

function PaymentInstructions({ applicationNo }) {
  return (
    <div className="payment-guide">
      <section>
        <h3>使用汇款者</h3>
        <p>请于一个月内至银行完成汇款。</p>
        <p className="highlight-note">
          汇款时请务必将申请编号 {applicationNo} 填在汇款单上的备注栏内。
        </p>
        <InfoRows
          rows={[
            ['Bank Name/银行名称', 'Bank of America'],
            ['Bank Address/银行地址', '438 86th Street, Brooklyn, NY 11209'],
            ['SWIFT CODE/美国境外汇款路线号码', 'BOFAUS3NXXX'],
            ['Routing Number/美国境内汇款路线号码', '052001633'],
            [
              'Beneficiary’s Account Name/账户名称',
              'Benevolent Buddhist Temple',
            ],
            ['Beneficiary’s Account Number/账户号码', '446009173958'],
          ]}
        />
      </section>

      <section>
        <h3>使用支票/汇票/银行本票者</h3>
        <p>请于一个月将支票/汇票/银行本票和此确认信一起邮寄到下列地址：</p>
        <address>P.O. Box 376, Shriley, NY 11967</address>
        <p>支票抬头请写 Benevolent Budhhist Temple</p>
      </section>

      <section>
        <h3>使用现金缴纳功德金者</h3>
        <p>请于点灯申请提交的一个月内，携带此确认信至慈行寺缴纳功德金。</p>
        <address>
          慈行寺地址：7116 Fort Hamilton Pkwy Brooklyn, NY 11228
        </address>
      </section>

      <section>
        <h3>使用Zelle缴纳功德金者</h3>
        <p>
          请于点灯申请提交的一个月内，将Zelle转账截图和此确认信发送邮件到下列邮箱。
        </p>
        <InfoRows
          rows={[
            ['Zelle号码', '6466069213'],
            ['Zelle户名', 'Benevolent Budhhist Temple'],
            ['官方邮箱', 'bbt.buddhists@gmail.com'],
          ]}
        />
      </section>

      <section>
        <h3>联系邮箱</h3>
        <p>若有任何问题，请联系 bbt.helps1@gmail.com</p>
      </section>
    </div>
  );
}

function InfoRows({ rows }) {
  return (
    <dl className="info-rows">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
