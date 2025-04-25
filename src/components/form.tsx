'use client';
import { useState, useEffect } from 'react';
import Button from '@/components/basic_button';

interface TalentSubmissionFormProps {
  onClose: () => void;
}

const TalentSubmissionForm: React.FC<TalentSubmissionFormProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    profilePicture: '',
    role: '',
    skills: [] as string[],
    languages: [] as string[],
    location: '',
    education: '',
    description: '',
    discordName: '',
    xLink: '',
    telegramLink: '',
    email: '',
    cvLink: '',
    transactionLink: '',
    continent: '',
    injectiveRole: '',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [submissionType, setSubmissionType] = useState<'new' | 'change'>('new');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const savedFormData = localStorage.getItem('talentFormData');
    if (savedFormData) {
      setFormData(JSON.parse(savedFormData));
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('talentFormData', JSON.stringify(formData));
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked
          ? [...(prev[name as keyof typeof formData] as string[]), value]
          : (prev[name as keyof typeof formData] as string[]).filter((item: string) => item !== value),
      }));
    } else {
      if (name === 'name' && value.length > 20) {
        return;
      }

      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleClose = () => {
    localStorage.removeItem('talentFormData');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('https://api.pedroinjraccoon.online/talendsubmit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log('Submission successful:', data);
      setCurrentPage(6);
      localStorage.removeItem('talentFormData');
    } catch (error) {
      console.error('Error submitting form:', error);
      setModalMessage('There was an error submitting your form. Please try again later.');
      setIsModalOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextPage = () => {
    if (currentPage === 3) {
      if (!formData.name || !formData.profilePicture || !formData.role || !formData.continent) {
        setModalMessage('Please fill out all required fields.');
        setIsModalOpen(true);
        return;
      }
    } else if (currentPage === 4) {
      if (!formData.education || !formData.description || !formData.injectiveRole || !formData.cvLink) {
        setModalMessage('Please fill out all required fields.');
        setIsModalOpen(true);
        return;
      }
    } else if (currentPage === 5) {
      if (!formData.transactionLink) {
        setModalMessage('Please fill out all required fields.');
        setIsModalOpen(true);
        return;
      }
    }

    setCurrentPage((prev) => prev + 1);
  };

  const prevPage = () => {
    setCurrentPage((prev) => prev - 1);
  };

  const handleSubmissionType = (type: 'new' | 'change') => {
    setSubmissionType(type);
    nextPage();
  };

  const handleCloseSuccessModal = () => {
    setIsModalOpen(false);
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-y-auto">
      <div className="bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-lg relative">
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Close form"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 w-full p-4 sm:p-8">
          {currentPage === 1 && (
            <div className="w-full">
              <div className="text-center w-full">
                <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mt-5 mb-4">
                  Talent Platform
                </h3>
                <div className="border-b border-gray-300 w-full mx-auto mb-4 sm:mb-6"></div>
                <p className="text-gray-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base py-5 w-full">
                  Show your skills on Injective? <br></br> <br></br>
                  Submit your information. All submissions are reviewed by our moderators to ensure quality and protect against scammers. Only Injective Lovers!
                  Once approved, your profile will be displayed on our website, making it easier for projects to discover talented individuals like you!
                </p>
              </div>
              <div className="flex justify-center">
                <Button
                  onClick={() => setCurrentPage(2)}
                  label="Continue"
                  className="px-4 py-2 sm:px-6 sm:py-3 text-gray-900 rounded-lg border-2 border-gray-900 hover:bg-gray-900 hover:text-white transition-all duration-300 text-sm sm:text-base w-32 sm:w-40"
                />
              </div>
            </div>
          )}

          {currentPage === 2 && (
            <div className="w-full">
              <div className="text-center w-full">
                <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mt-5 mb-4">
                  Submission Cost
                </h3>
                <div className="border-b border-gray-300 w-full mx-auto mb-4 sm:mb-6"></div>
                <p className="text-gray-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base py-5 w-full">
                  Send $PEDRO to burn address: <br />
                  <code className="bg-gray-300 p-1 rounded font-mono">inj1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqe2hm49</code>
                  <br /><br />
                  The submission fee is <strong className="text-gray-900">100,000 $PEDRO</strong> per year.
                  Please include your Discord name in the memo so we can verify it. If you own our NFT, the fee is just <strong className="text-gray-900">1 $PEDRO</strong>. 
                  Wanna change something just open ticket on discord, it cost <strong className="text-gray-900">25.000 $PEDRO</strong> to change/delete it.
                </p>
              </div>
              <div className="flex justify-center gap-4 w-full">
                <Button
                  onClick={() => handleSubmissionType('new')}
                  label="Start"
                  className="px-4 py-2 sm:px-6 sm:py-3 text-gray-900 rounded-lg border-2 border-gray-900 hover:bg-gray-900 hover:text-white transition-all duration-300 text-sm sm:text-base w-32 sm:w-40"
                />
              </div>
            </div>
          )}

          {currentPage === 3 && submissionType === 'new' && (
            <div className="w-full">
              <div className="text-center w-full">
                <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mt-5 mb-4">
                  About Yourself
                </h3>
                <div className="border-b border-gray-300 w-full mx-auto mb-4 sm:mb-6"></div>
              </div>
              <div className="space-y-4 w-full">
                <div className="w-full">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 w-full">
                    What is your name? (max 15 characters)
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                    required
                    maxLength={15}
                  />
                </div>
                <div className="w-full">
                  <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700 mb-1 w-full">
                    What will be your profile picture? (use <a href="https://imagekit.io/tools/image-to-url/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">this link</a> to generate a link for your profile picture)
                  </label>
                  <input
                    type="text"
                    id="profilePicture"
                    name="profilePicture"
                    value={formData.profilePicture}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                    required
                  />
                </div>
                <div className="w-full">
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1 w-full">
                    What is your role?
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                    required
                  >
                    <option value="">Select your role</option>
                    <option value="Blockchain Developer">Blockchain Developer</option>
                    <option value="Community Manager">Community Manager</option>
                    <option value="UX Designer">UX Designer</option>
                    <option value="NFT Artist">NFT Artist</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Moderator">Moderator</option>
                    <option value="Smart Contract Developer">Smart Contract Developer</option>
                    <option value="DeFi Analyst">DeFi Analyst</option>
                    <option value="Web3 Content Creator">Web3 Content Creator</option>
                    <option value="DAO Contributor">DAO Contributor</option>
                    <option value="Blockchain Researcher">Blockchain Researcher</option>
                    <option value="Tokenomics Designer">Tokenomics Designer</option>
                    <option value="Web3 Game Developer">Web3 Game Developer</option>
                    <option value="Blockchain Security Expert">Blockchain Security Expert</option>
                  </select>
                </div>
                <div className="w-full">
                  <label htmlFor="continent" className="block text-sm font-medium text-gray-700 mb-1 w-full">
                    In which continent do you live?
                  </label>
                  <select
                    id="continent"
                    name="continent"
                    value={formData.continent}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                    required
                  >
                    <option value="">Select your continent</option>
                    <option value="Africa">Africa</option>
                    <option value="Antarctica">Antarctica</option>
                    <option value="Asia">Asia</option>
                    <option value="Europe">Europe</option>
                    <option value="North America">North America</option>
                    <option value="Oceania">Oceania</option>
                    <option value="South America">South America</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-between mt-6 w-full">
                <Button
                  onClick={prevPage}
                  label="Previous"
                  className="px-4 py-2 sm:px-6 sm:py-3 text-gray-900 rounded-lg border-2 border-gray-900 hover:bg-gray-900 hover:text-white transition-all duration-300 text-sm sm:text-base w-32 sm:w-40"
                />
                <Button
                  onClick={nextPage}
                  label="Next"
                  className="ml-auto px-4 py-2 sm:px-6 sm:py-3 text-gray-900 rounded-lg border-2 border-gray-900 hover:bg-gray-900 hover:text-white transition-all duration-300 text-sm sm:text-base w-32 sm:w-40"
                />
              </div>
            </div>
          )}

          {currentPage === 4 && (
            <div className="w-full">
              <div className="text-center w-full">
                <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-4">
                  Tell Us About Yourself
                </h3>
                <div className="border-b border-gray-300 w-full mx-auto mb-4 sm:mb-6"></div>
              </div>
              <div className="space-y-4 w-full">
                <div className="w-full">
                  <label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-1 w-full">
                    What is your highest level of education?
                  </label>
                  <select
                    id="education"
                    name="education"
                    value={formData.education}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                    required
                  >
                    <option value="">Select your education level</option>
                    <option value="Kindergarten">Kindergarten</option>
                    <option value="Elementary School">Elementary School</option>
                    <option value="Middle School">Middle School</option>
                    <option value="High School">High School</option>
                    <option value="Bachelor">Bachelor</option>
                    <option value="Master Degree">Master Degree</option>
                    <option value="PhD">PhD</option>
                  </select>
                </div>
                <div className="w-full">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1 w-full">
                    How would you describe yourself? (max 500 characters)
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                    maxLength={500}
                    required
                  />
                </div>
                <div className="w-full">
                  <label htmlFor="injectiveRole" className="block text-sm font-medium text-gray-700 mb-1 w-full">
                    What is your role on Injective?
                  </label>
                  <select
                    id="injectiveRole"
                    name="injectiveRole"
                    value={formData.injectiveRole}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                    required
                  >
                    <option value="">Select your role</option>
                    <option value="Ninja">Ninja</option>
                    <option value="Warrior">Warrior</option>
                    <option value="Knight">Knight</option>
                  </select>
                </div>
                <div className="w-full">
                  <label htmlFor="cvLink" className="block text-sm font-medium text-gray-700 mb-1 w-full">
                    Share your CV! (link from Google Drive, make sure it's accessible)
                  </label>
                  <input
                    type="text"
                    id="cvLink"
                    name="cvLink"
                    value={formData.cvLink}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-between mt-6 w-full">
                <Button
                  onClick={prevPage}
                  label="Previous"
                  className="px-4 py-2 sm:px-6 sm:py-3 text-gray-900 rounded-lg border-2 border-gray-900 hover:bg-gray-900 hover:text-white transition-all duration-300 text-sm sm:text-base w-32 sm:w-40"
                />
                <Button
                  onClick={nextPage}
                  label="Next"
                  className="ml-auto px-4 py-2 sm:px-6 sm:py-3 text-gray-900 rounded-lg border-2 border-gray-900 hover:bg-gray-900 hover:text-white transition-all duration-300 text-sm sm:text-base w-32 sm:w-40"
                />
              </div>
            </div>
          )}

          {currentPage === 5 && (
            <div className="w-full">
              <div className="text-center w-full">
                <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-4">
                  Contact Information
                </h3>
                <div className="border-b border-gray-300 w-full mx-auto mb-4 sm:mb-6"></div>
              </div>
              <div className="space-y-4 w-full">
                <div className="w-full">
                  <label htmlFor="xLink" className="block text-sm font-medium text-gray-700 mb-1 w-full">
                    What is your X link? (optional)
                  </label>
                  <input
                    type="text"
                    id="xLink"
                    name="xLink"
                    value={formData.xLink}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                  />
                </div>
                <div className="w-full">
                  <label htmlFor="telegramLink" className="block text-sm font-medium text-gray-700 mb-1 w-full">
                    What is your Telegram link? (optional)
                  </label>
                  <input
                    type="text"
                    id="telegramLink"
                    name="telegramLink"
                    value={formData.telegramLink}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                  />
                </div>
                <div className="w-full">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 w-full">
                    What is your email? (optional)
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                  />
                </div>
                <div className="w-full">
                  <label htmlFor="transactionLink" className="block text-sm font-medium text-gray-700 mb-1 w-full">
                    Add here the transaction link (required)
                  </label>
                  <input
                    type="text"
                    id="transactionLink"
                    name="transactionLink"
                    value={formData.transactionLink}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-between mt-6 w-full">
                <Button
                  onClick={prevPage}
                  label="Previous"
                  className="px-4 py-2 sm:px-6 sm:py-3 text-gray-900 rounded-lg border-2 border-gray-900 hover:bg-gray-900 hover:text-white transition-all duration-300 text-sm sm:text-base w-32 sm:w-40"
                />
                <Button
                  type="submit"
                  label={isSubmitting ? 'Submitting...' : 'Submit'}
                  disabled={isSubmitting}
                  className="ml-auto px-4 py-2 sm:px-6 sm:py-3 text-gray-900 rounded-lg border-2 border-gray-900 hover:bg-gray-900 hover:text-white transition-all duration-300 text-sm sm:text-base w-32 sm:w-40"
                />
              </div>
            </div>
          )}

          {currentPage === 6 && (
            <div className="w-full">
              <div className="text-center w-full">
                <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mt-5 mb-4">
                  Submission Complete!
                </h3>
                <div className="border-b border-gray-300 w-full mx-auto mb-4 sm:mb-6"></div>
                <div className="flex justify-center mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Thank you for submitting your talent profile! Our team will review your submission 
                  and get back to you soon. You'll receive a confirmation on Discord once your profile 
                  is live on our platform.
                </p>
                <p className="text-gray-500 text-sm mb-6">
                  If you have any questions, please contact us on Discord.
                </p>
                <Button
                  onClick={handleClose}
                  label="Close"
                  className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors duration-300 text-base"
                />
              </div>
            </div>
          )}
        </form>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-6 max-w-sm mx-auto">
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Notice</h3>
                <p className="text-gray-600 mb-6">{modalMessage}</p>
                <Button
                  onClick={() => setIsModalOpen(false)}
                  label="OK"
                  className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors duration-300 text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TalentSubmissionForm;