import React, { useState, useEffect, Fragment } from 'react';
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import "@fortawesome/fontawesome-free/css/all.min.css";
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import { useMemo } from 'react';

import { MDBBadge, MDBBtn, MDBTable, MDBTableHead, MDBTableBody } from 'mdb-react-ui-kit';
import "./App.css"
import Button from '@mui/material/Button';
import FilterListIcon from '@mui/icons-material/FilterList';
import Loader from "./loader.gif";

const App = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [locationFilter, setLocationFilter] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [availableLocations, setAvailableLocations] = useState([]);
  const [availableIndustries, setAvailableIndustries] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true); // State for managing loading state

  const itemsPerPage = 15;
  useEffect(() => {
    fetchData();
  }, []);



  const API_URL = "https://oneture-assessment-backend-2.vercel.app/"

  const fetchData = async (pageNumber) => {
    try {
      setLoading(true);
      setLocationFilter('')
      setIndustryFilter('')
      setSearchTerm('')
      console.log("pageno came in fetchdata", pageNumber)
      const response = await axios.get(`${API_URL}api/data?pageNumber=${pageNumber}`);

      setData(response.data.items);

      const locations = [...new Set(response.data.items.map(item => item.item.additionalFields.displayLocation.toUpperCase()))];
      // in the industry field i can see some values are same but writing convention is different eg.financial services & financial-services to make them one i used this replace function 
      const industries = [...new Set(response.data.items.map(item => item.item.additionalFields.industry.toUpperCase().replace('-', ' ')))];
      setAvailableLocations(['', ...locations]); // Include an empty option for All Locations
      setAvailableIndustries(['', ...industries]); // Include an empty option for All Industries
      setFilteredData(response.data.items); // Initial load without filters
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false); // Set loading state to false when data fetching is complete
    }

  };

  const filterData = (location, industry, search) => {
    const filtered = data.filter(item => {
      const locationMatch = !location || item.tags.some(tag => tag.name.toLowerCase() === location.toLowerCase());
      const industryMatch = !industry || item.item.additionalFields.industry.toLowerCase() === industry.toLowerCase();
      const searchMatch = !search || item.item.additionalFields?.customerNameLower?.toLowerCase().includes(search.toLowerCase()) || item.item.additionalFields.descriptionSummary.toLowerCase().includes(search.toLowerCase());
      return locationMatch && industryMatch && searchMatch;
    });
    setFilteredData(filtered);
  };

  // const handlePageChange = async ({ selected }) => {
  //   setPageNumber(selected);
  //   // Calculate the offset for fetching data based on the selected page number
  //   const offset = selected * itemsPerPage
  //   try {
  //     // Fetch data from the API with the calculated offset
  //     const response = await axios.get(`${API_URL}?offset=${offset}`);

  //     // Update the filtered data with the new fetched data
  //     setFilteredData(response.data.items);
  //   } catch (error) {
  //     console.error('Error fetching data:', error);
  //   }
  // };

  const handleLocationFilterChange = (e) => {
    setLocationFilter(e.target.value);
    filterData(e.target.value, industryFilter, searchTerm);
  };

  const handleIndustryFilterChange = (e) => {
    setIndustryFilter(e.target.value);
    filterData(locationFilter, e.target.value, searchTerm);
  };

  const handleSearchTermChange = (e) => {
    console.log("search term", e.target.value)
    setSearchTerm(e.target.value);
    filterData(locationFilter, industryFilter, e.target.value);
  };

  const exportToExcel = async () => {
    try {
      // Make a GET request to the export endpoint
      const response = await axios.get(`${API_URL}api/export?pageNumber=${pageNumber}`, {
        responseType: 'blob' // Set responseType to 'blob' to receive binary data
      });
  
      // Create a blob object from the response data
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);
  
      // Create a link element
      const link = document.createElement('a');
  
      // Set the href attribute of the link to the temporary URL
      link.href = url;
  
      // Set the download attribute to specify the file name
      link.setAttribute('download', 'data.xlsx');
  
      // Append the link to the document body
      document.body.appendChild(link);
  
      // Trigger a click event on the link to initiate the download
      link.click();
  
      // Remove the link from the document body
      document.body.removeChild(link);
  
      // Revoke the temporary URL to release memory
      window.URL.revokeObjectURL(url);
  
      console.log("Excel file downloaded successfully");
    } catch (error) {
      console.error("Error downloading Excel file:", error);
    }
  };
  

  const handleNextPageChange = () => {
    setPageNumber(pageNumber + 1);
    fetchData(pageNumber + 1);

  };

  const handlePerviousPageChange = ({ selected }) => {
    setPageNumber(pageNumber - 1);
    fetchData(pageNumber - 1);

  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  return (
    <>
      {loading ? 
      
      <div className="loader-container">
          <div className="loader-background">
            <img src={Loader} alt="Loading..." />
          </div>
        </div>
      :
        <div className="container">
          <div className="filter-bar">
            <button className='toggleButton' onClick={toggleFilters}>
              <FilterListIcon /> Toggle Filters
            </button>
            <button onClick={exportToExcel}>Export to Excel</button>
            {showFilters && (
              <div className={`filters ${showFilters ? 'expanded' : 'collapsed'}`}>
                <input
                  type="text"
                  placeholder="Search customer name or description"
                  value={searchTerm}
                  onChange={handleSearchTermChange}
                />
                <select value={locationFilter} onChange={handleLocationFilterChange}>
                  <option value="">All Locations</option>
                  {availableLocations.map((item, index) => (
                    <option key={index} value={item}>{item}</option>
                  ))}
                </select>
                <select value={industryFilter} onChange={handleIndustryFilterChange}>
                  <option value="">All Industries</option>
                  {availableIndustries.map((item, index) => (
                    <option key={index} value={item}>{item}</option>
                  ))}
                </select>
                
              </div>
            )}

          
          </div>
          <MDBTable align='middle'>
            <MDBTableHead>
              <tr>
                <th scope='col'>Customer Details</th>
                {/* <th scope='col'>Name</th> */}
                <th scope='col'>Headline</th>
                <th scope='col'>Summary</th>
                <th scope='col'>Page URL</th>
                <th scope='col'>Location</th>
                <th scope='col'>Industry</th>
              </tr>
            </MDBTableHead>
            <MDBTableBody>



              {
                filteredData.map((item, index) => (
                  <Fragment>
                    <tr>
                      <td>
                        <div className='d-flex align-items-center'>
                          <img src={item.item.additionalFields.imageSrcUrl} alt="Customer Logo" style={{ width: '55px', height: '45px' }} className='rounded-circle' />


                          <div className='ms-3'>
                            <p className='fw-bold mb-1'>{item.item.additionalFields['customer-name']}</p>

                          </div>
                        </div>
                      </td>
                      <td>
                        <a href={item.item.additionalFields.headlineUrl} target="_blank" rel="noopener noreferrer">
                          {item.item.additionalFields.headline}
                        </a>
                      </td>

                      <td>
                        {item.item.additionalFields.descriptionSummary}
                      </td>
                      <td>

                        <a href={item.item.additionalFields.headlineUrl} target="_blank" rel="noopener noreferrer">
                          {item.item.additionalFields.headlineUrl}
                        </a>

                      </td>
                      <td>
                        {item.item.additionalFields.displayLocation}
                      </td>
                      <td>{item.item.additionalFields.industry}</td>
                    </tr>
                  </Fragment>
                ))}
            </MDBTableBody>
          </MDBTable>

          <nav class="paginate-container" aria-label="Pagination">
            <div class="pagination">

              {/* //disabiling the button */}
              
              {
                pageNumber ? <button className='pagination-button' onClick={handlePerviousPageChange} disabled={pageNumber === 0}>
                Previous Page
              </button>
              :
              <button className='disabled-button ' onClick={handlePerviousPageChange} disabled={pageNumber === 0}>
                Previous Page
              </button>
              }
              

              <p className="mx-4 my-2">{pageNumber}</p>
              <button className='pagination-button' onClick={handleNextPageChange}>
                Next Page
              </button>

            </div>
          </nav>


        </div>

      }

    </>
  );
};

export default App;

